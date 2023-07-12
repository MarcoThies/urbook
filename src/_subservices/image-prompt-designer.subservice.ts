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

    let characterImagePrompt = "Write exactly one prompt to best describe a given character.\n" +
      "Write down the appearance of the characters very precisely, go into detail about hair color, skin color and clothes.\n" +
      "Don't describe the location or surroundings of the character. Just focus on the looks. \n" +
      "Make sure the amount of prompts in your answer matches the count of character descriptions given below.\n\n" +
      "Each prompt must have less than 15 words!";

    const charaTextJoin = characters.map((char: CharacterEntity) => {
      return "["+char.name+"] "+char.description;
    });
    characterImagePrompt += charaTextJoin.join("\n\n");

    promptConversation.push({role: messageRole.user, content: characterImagePrompt} as IOpenAiPromptMessage);

    return promptConversation;
  }


  private ImgArtists = [
    "Don Bluth",
    "Tatsuro Kiuchi",
    "Ted Nasmith",
    "Mike Allred",
    "Carl Barks",
    "Guy Billout",
    "Matt Bors",
    "Allie Brosh",
    "Dick Bruna",
    "Hsiao Ron Cheng",
    "Joey Chou",
    "Bob Clampett",
    "Gemma Correll"
  ];

  public async addImagePromptsToChapter(book: BooksEntity, chapterId?: number): Promise<boolean|ChapterEntity[]>{
    const chapters= (!chapterId) ? book.chapters : [book.chapters[chapterId]];
    // 1. Generate one Text Prompt for creating image Prompts
    const textForImagePrompt: IOpenAiPromptMessage[] = this.generateStoryImagePrompts(chapters);
    // 2. Request Prompt from Request Manager to get image prompts
    const promptResults : boolean|string[]  = await this.requestManager.requestImagePromptsForImage(textForImagePrompt);
    if(promptResults === false || (promptResults as string[]).length < chapters.length){
      return false;
    }

    // select random Artist
    const bookImgArtist = this.ImgArtists[Math.floor(Math.random() * this.ImgArtists.length)];

    // 3. Map the result to the chapters
    for(let i in chapters) {
      let chapterPrompt = this.replaceStringWeight(promptResults[i].trim(), 40);
      const characterLen = (chapters[i].characters) ? chapters[i].characters.length : 0;
      if(characterLen > 0){
        const weight = Math.floor(30 / characterLen);
        for(let char of chapters[i].characters){
          if(!char.prompt) continue;
          const charPrompt = this.replaceStringWeight(char.prompt.trim(), weight);
          chapterPrompt += ' '+charPrompt;
        }
      }
      chapters[i].prompt = `${chapterPrompt} In the style of illustration like ${bookImgArtist}::25`
      chapters[i].changed = new Date();
    }

    console.log(chapters.map((c) => c.prompt));

    return chapters;
  }

  private replaceStringWeight(str: string, weight: number){
    // Check if the string ends with "::[int]" or just "::"
    const regexMatch = /::\d+$|::$|\.$/;
    if (str.match(regexMatch)) {
      // Replace the ending with "::[weight]"
      return str.replace(regexMatch, "::"+weight);
    } else {
      // Add "::[weight]" to the end of the string
      return str + "::"+weight;
    }
  }

  private generateStoryImagePrompts(chapter: ChapterEntity[]): IOpenAiPromptMessage[] {
    let promptConversation = this.addImageAiInstruction();

    let imagePrompt = ""+
      "Please give me exactly one prompt for each of the following enumerated paragraphs. Include a detailed description of the location and surroundings in each prompt\n";

    const storyTextJoin = chapter.map((cpt: ChapterEntity, indx : number) => {
      return (indx+1)+". "+cpt.paragraph;
    });
    imagePrompt += storyTextJoin.join("\n");

    // place paragraphs
    imagePrompt += "\n\n"+
      "Do not mention the story plot, dialogues within the story or any character name. Describe exactly one visual moment from each paragraph that can be displayed by a picture. " +
      "Start by describing what you can see in the foreground and then describe how the background should look like" +
      "Each prompt must have less than 15 words!";

    promptConversation.push(
      {role: messageRole.user, content: imagePrompt} as IOpenAiPromptMessage
    );
    return promptConversation;
  }


  private addImageAiInstruction(): IOpenAiPromptMessage[]{
    let instructionPrompt = ""+
      "You are an language model specialized in writing prompts for an image generating ai.\n"+
      "A Prompt is one short descriptive sentence that can be used to generate an image from text.\n"+
      "Here are the rules you must abide to when writing prompts:\n";

    instructionPrompt += "\n"+
      "- Use describing adjectives and only describe important details\n" +
      "- Answer in only one coherent sentence\n" +
      "- Use only present-temps for anything described\n" +
      "- do not reference the story plot\n" +
      "- do not reference any information from previous generated prompts\n" +
      "- do not describe any actions or events, rather describe a visual scene\n" +
      "- do not use commanding words like “Produce”, “Generate”, “Create” in the prompt but rather start describing the a specific scene\n" +
      "- Use commas (,) for soft breaks and double colons (::) for hard breaks to separate distinct concepts.\n"+
      "- Do not use any punctuation except commas (,) and double colons (::) for soft and hard breaks\n"+
      "- Do not state any character names, nor use names in any context. Character and things should only be described by adjectives not by names. \n"+
      "- Do use \"a person..\" or \"a big blue bunny...\" instead of \"the person...\" or \"the bunny...\"! Don't use \"the\" to refer to anything in general \n"+
      "- Output the prompt in correct english language. No other language should be present\n"+
      "- Tell an independent story with each single prompt. Different prompts should not build upon each other\n\n";

    instructionPrompt += "\n"+
      "Each and every prompt must work on its own, even though I may ask you to generate more than one at once. " +
      "Do not refer to any previous prompt in any way, do not name any characters or persons by their name. " +
      "Give me short, descriptive and on their own coherent sentences\n";
    return [{ role: messageRole.system, content: instructionPrompt} as IOpenAiPromptMessage];
  }

}