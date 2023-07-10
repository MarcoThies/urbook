import { CharacterEntity } from "./_shared/entities/character.entity";
import { RequestManagerSubservice } from "./request-manager.subservice";
import { Injectable } from "@nestjs/common";
import { IImageAvatar } from "./interfaces/image-character-prompt.interface";
import { ChapterEntity } from "./_shared/entities/chapter.entity";
import { DatabaseLoggerService } from "./_shared/database-logger.service";
import { IOpenAiPromptMessage, messageRole } from "./interfaces/openai-prompt.interface";
import { BooksEntity } from "./_shared/entities/books.entity";
import { ICharacterList } from "./interfaces/story-data.interface";

@Injectable()
export class ImagePromptDesignerSubservice {
  constructor(
    private readonly logManager : DatabaseLoggerService,
    private readonly requestManager: RequestManagerSubservice
  ) {}

  public async generateCharacterPrompts(characters:IImageAvatar[], bookRef: BooksEntity) : Promise<boolean|IImageAvatar[]> {

    // 1. Generate one Text Prompt for creating image Prompts
    const characterPromptConversation: IOpenAiPromptMessage[] = this.generateCharacterImagePrompt(characters);

    // 2. Request Prompt from Request Manager to get single image prompts
    const resultFromAi = await this.requestManager.requestCharacterPromptsForImage(characterPromptConversation);
    if(resultFromAi === false){
      return false;
    }

    await this.logManager.log('Generated character image prompts', __filename, "GENERATE", bookRef);

    // 3. Map the result to the characters
    for(let i in characters) {
      const charName = characters[i].name;

      const promptMatch = (resultFromAi as ICharacterList[]).find((item: ICharacterList) => {
        return item.name === charName;
      });

      if(promptMatch) {
        characters[i].prompt = promptMatch.prompt;
      }
    }

    return characters;
  }

  private generateCharacterImagePrompt(characters: IImageAvatar[]): IOpenAiPromptMessage[] {
    let promptConversation = this.addImageAiInstruction();

    let characterImagePrompt = "Write exactly one prompt to create a profile image for each of the following characters." +
      "Write down the appearance of the characters very precisely, go into detail about hair color, skin color and clothes." +
      "Make sure the amount of prompts in your answer matches the character descriptions given below.\n\n";

    const charaTextJoin = characters.map((char: CharacterEntity) => {
      return "["+char.name+"] "+char.description;
    });
    characterImagePrompt += charaTextJoin.join("\n\n");

    promptConversation.push({role: messageRole.user, content: characterImagePrompt} as IOpenAiPromptMessage);

    return promptConversation;
  }

  public async addImagePromptsToChapter(book: BooksEntity, chapterId?: number): Promise<boolean|ChapterEntity[]>{
    const chapters= (!chapterId) ? book.chapters : [book.chapters[chapterId]];
    // 1. Generate one Text Prompt for creating image Prompts
    const textForImagePrompt: IOpenAiPromptMessage[] = this.generateStoryImagePrompts(chapters);
    // 2. Request Prompt from Request Manager to get image prompts
    const promptResults : boolean|string[]  = await this.requestManager.requestImagePromptsForImage(textForImagePrompt);
    if(promptResults === false || (promptResults as string[]).length < chapters.length){
      return false;
    }
    // 3. Map the result to the chapters
    for(let i in chapters) {
      chapters[i].prompt = promptResults[i];
      chapters[i].changed = new Date();
    }

    return chapters;
  }

  private generateStoryImagePrompts(chapter: ChapterEntity[]): IOpenAiPromptMessage[] {
    let promptConversation = this.addImageAiInstruction();

    let imagePrompt = ""+
      "Please write exactly one prompt for each of the following enumerated paragraphs.\n"+
      "Do not refer to the story plot or any character name, but describe exactly one moment from each paragraph that can visualized in a picture:\n\n";

    const storyTextJoin = chapter.map((cpt: ChapterEntity, indx : number) => {
      // Todo add some more character specific info into or before the paragraph and refer to it
      let editParagraph = cpt.paragraph;
      if(cpt.characters.length > 0){
        for(let char of cpt.characters){
          while(true){
            let strPoint = 0;
            let occurrence = editParagraph.indexOf(char.name, strPoint);
            if(occurrence < 0){
              break;
            }
            // insert character specific info
            editParagraph = editParagraph.slice(0, occurrence) + ` (${char.description})` + editParagraph.slice(occurrence+char.name.length);
            strPoint = occurrence + char.description.length;
          }
        }
      }
      return (indx+1)+". "+editParagraph;
    });
    imagePrompt += storyTextJoin.join("\n");

    // place paragraphs
    imagePrompt += "\n\nDo not output any further text except the required answer.";
    promptConversation.push(
      {role: messageRole.user, content: imagePrompt} as IOpenAiPromptMessage
    );
    return promptConversation;
  }


  private addImageAiInstruction(): IOpenAiPromptMessage[]{
    let instructionPrompt = ""+
      "You are an language model specialized in writing prompts for an image generating ai.\n"+
      "Prompts are short descriptive sentences that can be used to generate images from text.\n"+
      "Here are the rules you must abide to when writing prompts:\n";

    instructionPrompt += "\n"+
      "- Use describing adjectives but keep it to only important details when describing an image\n" +
      "- do not reference the story plot in any way\n" +
      "- do not reference any information from previous generated prompts\n" +
      "- tell a independent story with each single prompt. Different prompts should not build upon each other\n" +
      "- do not describe any actions or events, rather describe a visual scene\n" +
      "- do not use commanding words like “Produce”, “Generate”, “Create” in the prompt but rather start describing the a specific scene\n" +
      "- Use commas (,) for soft breaks and double colons (::) for hard breaks to separate distinct concepts. You can also use numerical weights (e.g., “::2” or “::5”) after double colons to emphasize certain sections. These are placed after the word that’s being emphasized, not before.\n"+
      "- To discourage the use of a concept, use negative image weights (e.g., “::-1”) these are placed after the word that’s being depreciated\n" +
      "- Incorporate descriptive language and specific details, such as camera angles, artists’ names, lighting, styles, processing techniques, camera settings, post-processing terms, and effects.\n"+
      "- Do not state any character names, nor use names in any context. Character and things should only be described by adjectives not by names. \n"+
      "- Do use \"a person..\" or \"a big blue bunny...\" instead of \"the person...\" or \"the bunny...\"! Don't use \"the\" to refer to anything in general \n"+
      "- Do not use any punctuation except commas (,) and double colons (::) for soft and hard breaks\n"+
      "- Output the prompt in correct english language. No other language should be present\n\n"+
      "If the content of the prompt is not clear, the AI will not be able to generate a good image."

    instructionPrompt += "\n"+
      "These rules should enable you to create prompts that work like these examples:\n"+

      "Input: Es war einmal ein kleiner Junge namens Tom. Er war immer neugierig und liebte es, neue Dinge zu entdecken. Eines Tages fand er eine geheimnisvolle Uhr in seinem Garten. Die Uhr hatte bunte Knöpfe und blinkende Lichter.\n"+
      "Output: A boy with brown curly hair and adventures glare in his eyes stands inside his garden::20 he seems to have spotted something in the tall green grass.\n\n"+
      "Input:  Als Tom die Uhr berührte, begann sie plötzlich zu leuchten und zu ticken. Plötzlich wurde er von einem grellen Licht umgeben und fand sich in einer anderen Zeit wieder! Er war aufgeregt und ein wenig ängstlich zugleich.\n"+
      "Output: A boy with brown curly hair and adventures glare but frightened looks enters a time wrap environment::30 it's bright and full of saturated colors and lights::40\n\n"+
      "Input In dieser neuen Zeit traf Tom auf eine freundliche Giraffe namens Greta. Sie war genauso neugierig wie er und gemeinsam beschlossen sie, die Welt der Zeitreisen zu erkunden. Mit der magischen Uhr konnten sie in verschiedene Zeiten reisen und spannende Abenteuer erleben.\n"+
      "Output A boy with brown curly hair stand next to a big giraffe with a friendly smile::20 they are visiting an adventures place in a different time:15\n\n"

    instructionPrompt += "\n"+
      "Every time I tell you to write prompts, you create a amazing prompt for a high quality image in a manga or comic style";
    return [{ role: messageRole.system, content: instructionPrompt} as IOpenAiPromptMessage];
  }

}