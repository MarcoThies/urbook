import { CharacterEntity } from "./_shared/entities/character.entity";
import { RequestManagerSubservice } from "./request-manager.subservice";
import { Injectable } from "@nestjs/common";
import { IImageAvatar } from "./interfaces/image-character-prompt.interface";
import { ChapterEntity } from "./_shared/entities/chapter.entity";
import { DatabaseLoggerService } from "./_shared/database-logger.service";
import { IOpenAiPromptMessage, messageRole } from "./interfaces/openai-prompt.interface";

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

  private generateStoryImagePrompts(chapter: ChapterEntity[]): IOpenAiPromptMessage[] {
    let promptConversation = this.addImageAiInstruction();

    // let imageImagePrompt = this.addImageAiInstruction();
    let imageImagePrompt = ""+
      "Please write exactly one prompt for each of the following paragraphs."+
      "Do not refer to the story plot or any character name, but describe exactly one moment from each paragraph that can visualized in a picture:\n\n";
    const storyTextJoin = chapter.map((cpt: ChapterEntity, indx : number) => {
      return "["+(indx+1)+"] "+cpt.paragraph;
    });
    imageImagePrompt += storyTextJoin.join("\n\n");

    // place paragraphs
    imageImagePrompt += "\n\nWrite the index of the paragraph in square brackets before the generated prompt. (e.g.: [1] This is the first prompt). Do not output any further text except the required answer.";
    promptConversation.push(
      {role: messageRole.user, content: imageImagePrompt} as IOpenAiPromptMessage
    );
    return promptConversation;
  }


  private addImageAiInstruction(): IOpenAiPromptMessage[]{
    let instructionPrompt = ""+
      "You are an language model specialized in writing prompts for another image ai.\n"+
      "Prompts are short descriptive sentences that can be used to generate images from text.\n"+
      "Here are the guidelines by which you create these image-prompts:";

    instructionPrompt += "\n\n"+
      "- write descriptive sentences, use a lot of adjectives to describe details. But keep it to important details only\n" +
      "- don't use any character names or story plot references in the prompt itself\n" +
      "- don't use commands like 'Generate ....' or 'Create....' in the prompt but rather just start describing the image\n" +
      "- Use commas for soft breaks and double colons (::) for hard breaks to separate distinct concepts. You can also use numerical weights (e.g., “::2” or “::5”) after double colons to emphasize certain sections. These are placed after the word that’s being emphasized, not before.\n"+
      "- To discourage the use of a concept, use negative image weights (e.g., “::-1”) these are placed after the word that’s being depreciated\n" +
      "- Incorporate descriptive language and specific details, such as camera angles, artists’ names, lighting, styles, processing techniques, camera settings, post-processing terms, and effects.\n"+
      "- Include multiple image processing technologies and terms for the desired effects and image quality.\n" +
      "- Use your creativity to incorporate various lighting scenarios into the images.\n" +
      "- Use specific shades of primary colors and experiment with different styles.\n" +
      "- Specify specific camera angles, such as selfies, panoramic views, GoPro images, fish-eye, or satellite view.\n" +
      "- Utilize words like \"award-winning,\" \"masterpiece,\" \"photoreal,\" \"highly detailed,\" \"intricate details,\" and \"cinematic\" for more realistic images.\n";

    instructionPrompt += "\n\n"+
      "Every time I tell you to write prompt you will imagine you are writing a prompt for a specific high budget film director to create an image that will he or she will use to pitch a scene to executives that will convince them, based on its creativity, concept, depth of intrigue and imagery to invest billions of dollars into the production of this movie.\n"+
      "Describe the image in the prompt. Write a prompt.";
    return [{ role: messageRole.system, content: instructionPrompt} as IOpenAiPromptMessage];
  }

}