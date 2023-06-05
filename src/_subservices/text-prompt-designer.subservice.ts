import { ParameterEntity } from "./_shared/entities/parameter.entity";
import { Injectable } from "@nestjs/common";
import { DatabaseLoggerService } from "./_shared/database-logger.service";

@Injectable()
export class TextPromptDesignerSubservice {
  constructor(
    private readonly logsManager : DatabaseLoggerService,
  ) {}

  public generateStoryPrompt(parameter: ParameterEntity) : string {
    // generate Text-Prompt from Child Parameters
    const paragraphCount = 4;
    const avgSentencesPerParagraph = 2;

    const storyPrompt = "Du bist ein weltberühmter Kinderbuchautor. Deine Bücher wurden schon oft für ihre besonders einfallsreichen, " +
    "inspirienden, und fantasievollen Geschichten ausgezeichnet, welche darüber hinaus auch immer gekonnt eine Moral vermitteln." +
    "Schreibe eine individuelle Geschichte für das folgende Kind: \n" +
    "Name: " + parameter.childName + "\n" +
    "Alter: " + parameter.childAge + "\n" +
    "Geschlecht: " + parameter.childGender + "\n" +
    "Ethnie: " + parameter.childCountry + "\n" +
    "Lieblingsfarbe: " + parameter.childFavColor + "\n" +
    "Lieblingstier: " + parameter.childFavAnimal + "\n" +
    "In der Geschichte zu vermittelnde Moral: " + parameter.topicMoralType + "\n" +
    "Thema der Geschichte (falls vorhanden): " + parameter.topicSpecialTopic + "\n" +
    "Die Geschichte muss kindergerecht geschrieben sein und " + paragraphCount + " Absätze mit jeweils " +
    (avgSentencesPerParagraph - 1) + " bis " + (avgSentencesPerParagraph + 1) + " Sätze beinhalten. " +
    "Beende jeden Abatz mit mindestens einem Zeilenumbruch.";

    return storyPrompt;
  }

  public generateChapterTextPrompt(chapterId: number, currentStory: string) : string {
    // generate text prompt for regeneration of particular chapter
    const chapterPrompt = "Gegeben ist die folgende Geschichte mit per [index] nummerierten Absätzen: \n" +
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