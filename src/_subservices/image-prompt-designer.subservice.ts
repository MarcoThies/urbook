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

    let characterImagePrompt = "Write exactly one prompt to create a profile image for each of the following characters. Make sure the amount of prompts in your answer matches the character descriptions given below.\n\n";
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
    console.log("DBG: started");
    const textForImagePrompt: IOpenAiPromptMessage[] = this.generateStoryImagePrompts(chapters);
    // 2. Request Prompt from Request Manager to get single image prompts
    let promptResultText: string[][] = [];
    //    Assure that there are as many prompts characters
    console.log("DBG: started2" + promptResultText.length + chapters.length);
    while (promptResultText.length !== chapters.length) {
      if (promptResultText.length !== 0) {
        await this.logManager.warn('Story image prompts dont match required count... retry', __filename, "GENERATE", book);
        console.log("DEBUG: Detected mismatching no. of chapters and chapter prompts - regenerating prompts..");
      }
      console.log("DBG: loop started");
      const promptResults : boolean|string[][]  = await this.requestManager.requestImagePromptsForImage(textForImagePrompt);
      if(promptResults === false) {
        return false;
      }
      promptResultText = promptResults as string[][];
      await this.logManager.log('Generated story image prompts successfully', __filename, "GENERATE", book);
    }
    console.log("DBG: started3");
    // 3. Map the result to the chapters
    for(let i in chapters) {
      if(!promptResultText[i] || promptResultText[i].length < 2) {
        console.log("Chapter " + i + ": \n" + promptResultText[i] + "\n");
        continue;
      }
      chapters[i].prompt = promptResultText[i][1];
      chapters[i].changed = new Date();
    }
    console.log("DBG: Length " + chapters.length + "\nContent" + chapters[0].prompt + " \nimgUrl" + chapters[0].imageUrl);

    return chapters;
  }

  private generateStoryImagePrompts(chapter: ChapterEntity[]): IOpenAiPromptMessage[] {
    let promptConversation = this.addImageAiInstruction();

    // let imageImagePrompt = this.addImageAiInstruction();
    let imagePrompt = ""+
      "Please write exactly one prompt for each of the following paragraphs."+
      "Do not refer to the story plot or any character name, but describe exactly one moment from each paragraph that can visualized in a picture:\n\n";
    const storyTextJoin = chapter.map((cpt: ChapterEntity, indx : number) => {
      return "["+(indx+1)+"] "+cpt.paragraph;
    });
    imagePrompt += storyTextJoin.join("\n");

    // TODO: Map character-description text to appearance of names in the chapter

    // place paragraphs
    imagePrompt += "\n\nDo not output any further text except the required answer. Write the index of the paragraph in square brackets before the generated prompt. (e.g.: [1] This is the first prompt).";
    promptConversation.push(
      {role: messageRole.user, content: imagePrompt} as IOpenAiPromptMessage
    );
    return promptConversation;
  }


  private addImageAiInstruction(): IOpenAiPromptMessage[]{
    let instructionPrompt = ""+
      "You are an language model specialized in writing prompts for an image generating ai.\n"+
      "Prompts are short descriptive sentences that can be used to generate images from text.\n"+
      "Here are the rules you have to follow when writing prompts:\n\n";

    instructionPrompt += "\n\n"+
      "- Use describing adjectives but keep it to important details when describing an image\n" +
      "- do not use character names, or any names at all" +
      "- do not reference the story plot in any way\n" +
      "- do not describe any actions or events, rather describe the scene\n" +
      "- don not use commanding words like “Produce”, “Generate”, “Create” in the prompt but rather start describing the a scene\n" +
      "- Use commas (,) for soft breaks and double colons (::) for hard breaks to separate distinct concepts. You can also use numerical weights (e.g., “::2” or “::5”) after double colons to emphasize certain sections. These are placed after the word that’s being emphasized, not before.\n"+
      "- To discourage the use of a concept, use negative image weights (e.g., “::-1”) these are placed after the word that’s being depreciated\n" +
      "- Incorporate descriptive language and specific details, such as camera angles, artists’ names, lighting, styles, processing techniques, camera settings, post-processing terms, and effects.\n"+
      "- Use your creativity to incorporate various lighting scenarios into the images.\n" +
      "- Utilize words like \"award-winning,\" \"masterpiece,\" \"photoreal,\" \"highly detailed,\" \"intricate details,\" and \"cinematic\" for more realistic images.\n";

    instructionPrompt += "\n\n"+
      "Every time I tell you to write prompts, you will imagine you are writing a prompt for a specific high budget film director to create an image that will he or she will use to pitch a scene to executives that will convince them, based on its creativity, concept, depth of intrigue and imagery to invest billions of dollars into the production of this movie.\n"+
      "Describe the image in the prompt. Write a prompt.";
    return [{ role: messageRole.system, content: instructionPrompt} as IOpenAiPromptMessage];
  }

}