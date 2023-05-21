import { ParameterEntity } from "../generate/entities/parameter.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class TextPromptDesignerSubservice {
  constructor() {
  }

  public generateStoryPrompt(parameter: ParameterEntity) : string {
    // generate Text-Promt from Child Parameters
    const textPromt = "Schreib mir eine Geschichte, für 5-Jähre mit 6 Absätze je 3-4 Sätzen." +
    "Die Geschichte sollte um Piraten gehen und eine mindestens eine Moral-Entscheidung für Kinder schön aufarbeiten"
    return textPromt;
  }

  public generateChapterTextPrompt(chapterId: number, currentStory: string) : string {
    // generate text prompt for regeneration of particular chapter
    const textPromt = "Gegeben ist die foglende Geschichte mit per [index] nummerierten Absätzen: " +
    currentStory +
    "\nGeneriere einen neuen Text für Absatz " + chapterId + " und gebe nur diesen als Antwort zurück. " +
    "Im neu generierten Text müssen die gleichen Charaktere vorkommen wie im alten."
    return textPromt;
  }

  public generateCharacterDescriptionsPrompt(fullStory: string) : string {
    let characterPromt = "Schreibe jeweils eine sehr bildlich beschreibende Characterbeschreibung für jeden Character in diesem Text:\n\n";
    characterPromt += fullStory + "\n\n";

    characterPromt += "Benutze kurze und nur beschreibende Sätze. Lasse unnötige Füllwörter weg.\n" +
      "Beziehe dich ausschließlich auf das Aussehen und die Aussenwirkung der Person. Schreibe vor die Charakterisierung immer den Namen der Person / Characters mit [Name]\n"
    return characterPromt;
  }
}