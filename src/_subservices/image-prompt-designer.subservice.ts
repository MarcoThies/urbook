import { CharacterEntity } from "./_shared/entities/character.entity";
import { RequestManagerSubservice } from "./request-manager.subservice";
import { Injectable } from "@nestjs/common";
import { IImageAvatar } from "./interfaces/image-character-prompt.interface";
import { ChapterEntity } from "./_shared/entities/chapter.entity";
import { DatabaseLoggerService } from "./_shared/database-logger.service";

@Injectable()
export class ImagePromptDesignerSubservice {
  constructor(
    private readonly logsManager : DatabaseLoggerService,
    private readonly requestManager: RequestManagerSubservice
  ) {}

  public async generateCharacterPrompts(characters:IImageAvatar[]) : Promise<IImageAvatar[]> {

    // 1. Generate one Text Prompt for creating image Prompts
    const characterPromptText: string = this.generateCharacterImagePrompt(characters);

    // 2. Request Prompt from Request Manager to get single image prompts
    const promptResultText: string[][] = await this.requestManager.requestCharacterPromptsForImage(characterPromptText);

    // 3. Map the result to the characters
    for(let i in characters) {
      const charName = characters[i].name;

      const promptMatch = promptResultText.find((item: string[]) => {
        return item[0] === charName;
      });

      if(promptMatch) {
        characters[i].prompt = promptMatch[1];
      }
    }

    return characters;
  }

  private generateCharacterImagePrompt(characters: IImageAvatar[]): string {
    let characterImagePrompt = this.addImageAiInstruction();

    // characterImagePrompt += "Schreibe mit diesem Wissen für jeden der folgend genannten Charaktere jeweils genau einen 'Prompt' zur Erstellung eines Charakter-Portraits im Comic Stil mit der genannten Image-Ki:\n\n";
    characterImagePrompt += "With this knowledge, write exactly one 'prompt' for each of the following characters. Make sure the amount of prompts in your answer match the character descriptions given below.\n\n";
    const charaTextJoin = characters.map((char: CharacterEntity) => {
      return "["+char.name+"] "+char.description;
    });
    characterImagePrompt += charaTextJoin.join("\n\n");

    //characterImagePrompt += "\n\nSchreibe vor dem genierten Prompt immer den Namen der Person / Characters in eckigen Klammern, aber lasse den Namen auf jeden Fall aus den Prompts selbst aus!"
    characterImagePrompt += "\n\nWrite the name of the character in square brackets before the generated prompt. (e.g.: [Max] This is a prompt). Do not output any further text except the required answer.";


    return characterImagePrompt;
  }

  public async generateStoryImages(chapters: ChapterEntity[]): Promise<ChapterEntity[]>{
    // 1. Generate one Text Prompt for creating image Prompts
    const textForImagePrompt: string = this.generateStoryImagePrompts(chapters);

    // 2. Request Prompt from Request Manager to get single image prompts
    const promptResultText: string[][] = await this.requestManager.requestImagePromptsForImage(textForImagePrompt);
    // 3. Map the result to the chapters

    for(let i in chapters) {
      // TODO: Check if the prompt has the right format before accessing
      if(!promptResultText[i] || promptResultText[i].length < 2) {
        console.log("Chapter " + i + ": \n" + promptResultText[i] + "\n");
        continue;
      }
      chapters[i].prompt = promptResultText[i][1];
      chapters[i].changed = new Date();
    }

    return chapters;
  }

  private generateStoryImagePrompts(chapter: ChapterEntity[]): string {
    let imageImagePrompt = this.addImageAiInstruction();
    imageImagePrompt += "Use that knowledge to write exactly one 'prompt' for each of the following paragraphs. This prompt should later be used to generate the image with another ai service. Do not refer to the story plot, but describe exactly what can be seen in each picture:\n\n";
    const storyTextJoin = chapter.map((cpt: ChapterEntity, indx : number) => {
      return "["+(indx+1)+"] "+cpt.paragraph;
    });
    imageImagePrompt += storyTextJoin.join("\n\n");

    // place paragraphs
    imageImagePrompt += "\n\nWrite the index of the paragraph in square brackets before the generated prompt. (e.g.: [1] This is a prompt). Do not output any further text except the required answer."
    return imageImagePrompt;
  }


  private addImageAiInstruction(): string{
    let instructionPrompt = "Here are some instructions on how to write a good prompts for an ai image generating service:\n\n";

    // characterImagePrompt += "<<Load some File content here>>";

    instructionPrompt += "\n\n"+
      "- write descriptive sentences, use a lot of adjectives to describe details. But keep it to important details only\n" +
      "- don't use any character names or story plot references in the prompt itself\n" +
      "- don't use commands like 'Generate ....' or 'Create....' in the prompt but rather just start describing the image\n" +
      "- you can give single words more meaning by adding two colons, followed by a number weight between 1 and 100 (e.g.: blue caterpillar::25 and its big tree::40)\n";


    return instructionPrompt+"\n\n";
  }

}