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

    characterImagePrompt += "Schreibe mit diesem Wissen für jeden der folgend genannten Charaktere jeweils genau einen 'Prompt' zur Erstellung eines Charakter-Portraits im Comic Stil mit der genannten Image-Ki:\n\n";

    const charaTextJoin = characters.map((char: CharacterEntity) => {
      return char.description;
    });
    characterImagePrompt += charaTextJoin.join("\n\n");

    characterImagePrompt += "\n\nSchreibe vor dem genierten Prompt immer den Namen der Person / Characters in eckigen Klammern, aber lasse den Namen auf jeden Fall aus den Prompts selbst aus!"

    return characterImagePrompt;
  }

  public async generateStoryImages(chapters: ChapterEntity[]): Promise<ChapterEntity[]>{
    // 1. Generate one Text Prompt for creating image Prompts
    const textForImagePrompt: string = this.generateStoryImagePrompts(chapters);

    // 2. Request Prompt from Request Manager to get single image prompts
    const promptResultText: string[][] = await this.requestManager.requestImagePromptsForImage(textForImagePrompt);
    // 3. Map the result to the chapters
    console.log(promptResultText);

    for(let i in chapters) {
      // TODO: Check if the prompt has the right format before accessing
      chapters[i].prompt = promptResultText[i][1];
      chapters[i].changed = new Date();
    }

    return chapters;
  }

  private generateStoryImagePrompts(chapter: ChapterEntity[]): string {
    let imageImagePrompt = this.addImageAiInstruction("--ar 1:2 --niji 5 --style scenic");
    imageImagePrompt += "Schreibe mit diesem Wissen für jeden der folgendenden Absätze jeweils genau einen 'Prompt' zur Erstellung eines passenden Bildes. Beziehe dich dabei nicht auf die Rahmenhandlung sondern beschreibe ganz genau, was auf dem Bild zu sehen ist:\n\n";

    const storyTextJoin = chapter.map((cpt: ChapterEntity) => {
      return cpt.paragraph;
    });
    imageImagePrompt += storyTextJoin.join("\n\n");

    // place paragraphs
    imageImagePrompt += "\n\nSchreibe vor den genierten Prompt immer den Index des Absatz in eckigen Klammern. (Bsp.: [1] Das ist ein Prompt). Gib außer der geforderten Antwort keinen weiteren Text aus"

    return imageImagePrompt;
  }


  private addImageAiInstruction(imageAiSuffix = "--ar 1:1 --niji 5"): string{
    let characterImagePrompt = "Hier ist eine Anleitung für die Verfassung von Prompts für eine Image-KI:\n\n";

    // characterImagePrompt += "<<Load some File content here>>";

    characterImagePrompt += "\n\n"+
      "- keine ganzen Sätze bilden, sondern nur Kurzbeschreibung durch Komma getrennt\n" +
      "- Füllwörter weglassen\n" +
      "- verwende \"weights\" um wichtige Eigenschaften hervorzuheben. Lege die Wichtung für ein Wort fest, indem du es mit zwei doppelpunkten und folgend dem gewünschten Wert makierst. Beispiel: \"..er fährt mit einem roten::30 Auto::25 nach hause\"\n" +
      "- Beschreibende infos zur verschönerung, wie zb \"cinematic\", \"4k\", \"high detail\" an den prompt anfügen\n" +
      // "- ans Ende jeden Prompt folgend suffix anhängen: '"+imageAiSuffix+"'\n" +
      "- schreibe ausschließlich auf Englisch \n\n";

    return characterImagePrompt
  }

}