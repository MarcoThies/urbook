import { CharacterEntity } from "../generate/entities/character.entity";
import { RequestManagerSubservice } from "./request-manager.subservice";
import { Injectable } from "@nestjs/common";
import { IImageAvatar } from "./interfaces/image-character-prompt.interface";

@Injectable()
export class ImagePromtDesignerSubservice {
  constructor(
    private readonly requestManager: RequestManagerSubservice
  ) {}

  public async generateCharacterImages(characters:IImageAvatar[]) : Promise<IImageAvatar[]> {

    // 1. Generate one Text Prompt for creating image Prompts
    const characterPromptText: string = this.generateCharacterImagePrompt(characters);

    // 2. Request Prompt from Request Manager to get single image prompts
    const promptResultText: string[][] = await this.requestManager.requestCharacterPromptsForImage(characterPromptText);

    // 3. Map the result to the characters
    for(var i in characters) {
      const charName = characters[i].name;

      const promtMatch = promptResultText.find((item: string[]) => {
        return item[0] === charName;
      });

      if(promtMatch) {
        characters[i].prompt = promtMatch[1];
      }
    }

    return characters;
  }


  private generateCharacterImagePrompt(characters: IImageAvatar[]): string {
    let characterImagePromt = "Hier ist eine Anleitung für die Verfassung von Prompts für eine Image-KI:\n\n";

    characterImagePromt += "<<Load some File content here>>";

    characterImagePromt += "\n\n"+
      "- keine ganzen Sätze bilden, sondern nur Kurzbeschreibung durch Komma getrennt\n" +
      "- Füllwörter weglassen\n" +
      "- verwende \"weights\" um wichtige Eigenschaften hervorzuheben. Lege die Wichtung für ein Wort fest, indem du es mit zwei doppelpunkten und folgend dem gewünschten Wert makierst. Beispiel: \"..er fährt mit einem roten::30 Auto::25 nach hause\"\n" +
      "- Beschreibende infos zur verschönerung, wie zb \"cinematic\", \"4k\", \"high detail\" an den promt anfügen\n" +
      "- ans Ende jeden Prompt folgend suffix anhängen: \"--ar 1:1 --niji 5 --style scenic\"\n" +
      "- schreibe ausschließlich auf Englisch";

    characterImagePromt += "\n\n"+
    "Schreibe mit diesem Wissen für jeden der folgend genannten Charaktere jeweils genau einen 'Prompt' zur Erstellung eines Charakter-Portraits im Comic Stil mit der genannten Image-Ki:\n\n";

    const charaTextJoin = characters.map((char: CharacterEntity) => {
      return char.description;
    });
    characterImagePromt += charaTextJoin.join("\n\n");

    characterImagePromt += "\n\nSchreibe vor den genierten Prompt immer den Namen der Person / Characters in eckigen Klammern, aber lasse den Namen auf jeden Fall aus den Prompts selbst aus!"

    return characterImagePromt;
  }
}