import { ParameterEntity } from "../_shared/entities/parameter.entity";
import { Injectable } from "@nestjs/common";
import { DatabaseLoggerService } from "../_shared/database-logger.service";

@Injectable()
export class TextPromptDesignerSubservice {
  constructor(
    private readonly logsManager : DatabaseLoggerService,
  ) {}

  public generateStoryPrompt(parameter: ParameterEntity) : string {
    // generate Text-Prompt from Child Parameters
    const storyPrompt = "Schreib mir eine Geschichte, für 5-Jähre mit 6 Absätze je 3-4 Sätzen." +
    "Die Geschichte sollte um Piraten gehen und eine mindestens eine Moral-Entscheidung für Kinder schön aufarbeiten"
    return storyPrompt;
  }

  public generateChapterTextPrompt(chapterId: number, currentStory: string) : string {
    // generate text prompt for regeneration of particular chapter
    const chapterPrompt = "Gegeben ist die foglende Geschichte mit per [index] nummerierten Absätzen: " +
    currentStory +
    "\nGeneriere einen neuen Text für Absatz " + chapterId + " und gebe nur diesen als Antwort zurück. " +
    "Im neu generierten Text müssen die gleichen Charaktere vorkommen wie im alten."
    return chapterPrompt;
  }

  public generateCharacterDescriptionsPrompt(fullStory: string) : string {
    let characterPrompt = "Schreibe jeweils eine sehr bildlich beschreibende Characterbeschreibung für jeden Character in diesem Text:\n\n";
    characterPrompt += fullStory + "\n\n";

    characterPrompt += "Benutze kurze und nur beschreibende Sätze. Lasse unnötige Füllwörter weg.\n" +
      "Beziehe dich ausschließlich auf das Aussehen und die Aussenwirkung der Person. Schreibe vor die Charakterisierung immer den Namen der Person / Characters mit [Name]\n"
    return characterPrompt;
  }
}