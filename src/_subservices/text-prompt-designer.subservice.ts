import { ParameterEntity } from "./_shared/entities/parameter.entity";
import { Injectable } from "@nestjs/common";
import { DatabaseLoggerService } from "./_shared/database-logger.service";

@Injectable()
export class TextPromptDesignerSubservice {
  constructor(
    private readonly logsManager: DatabaseLoggerService,
  ) {
  }

  public generateStoryPrompt(parameter: ParameterEntity): string {
    // generate Text-Prompt from Child Parameters
    const paragraphCount = parameter.topicChapterCount;
    const avgSentencesPerParagraph = 2;

    const storyPrompt = "Du bist ein weltberühmter Kinderbuchautor. Deine Bücher wurden schon oft für ihre besonders einfallsreichen, " +
      "inspirienden, und fantasievollen Geschichten ausgezeichnet, welche darüber hinaus auch immer gekonnt eine Moral vermitteln." +
      "Schreibe eine personalisierte Geschichte für das folgende Kind mit den aufgeführten Anweisungen: \n" +
      "Name: " + parameter.childName + "\n" +
      "Alter: " + parameter.childAge + "\n" +
      "Geschlecht: " + parameter.childGender + "\n" +
      "Ethnie: " + parameter.childCountry + "\n" +
      "Du kannst die Ethnie des Kindes für die Geschichte nutzen aber erwähne sie nicht explizit." +

      "Lieblingsfarbe: " + parameter.childFavColor + "\n" +
      "Lieblingstier: " + parameter.childFavAnimal + "\n" +

      "Die in der Geschichte zu vermittelnde Moral lautet: " + parameter.topicMoralType + "\n" +
      "Die Moral muss stimmig in den Geschichtsverlauf eingebettet werden." +

      "Die Geschichte spielt in/im " + parameter.topicSpecialTopic + ".\n" +

      "Die Geschichte soll " + paragraphCount + " Absätze mit jeweils " + (avgSentencesPerParagraph - 1) + " bis " + (avgSentencesPerParagraph + 1) + " Sätzen beinhalten. " +
      "Die Geschichte muss kindergerecht, fantasievoll und zusammenhängend geschrieben sein." +
      "Wenn du die Angaben über das Kind im Text benutzt, bette sie unauffällig und stimmig in den Lauf der Geschichte ein." +
      "Idealerweise enthält die Geschichte einen Spannungsbogen und eine Herausforderung, die das Kind meistert und daraus etwas lernt." +
      "Beende jeden Abatz mit mindestens einem Zeilenumbruch.";

    return storyPrompt;
  }

  public generateChapterTextPrompt(chapterId: number, currentStory: string): string {
    // generate text prompt for regeneration of particular chapter
    const chapterPrompt = "Gegeben ist die folgende Geschichte mit per [index] nummerierten Absätzen: \n" +
      currentStory +
      "\nGeneriere einen neuen Text für Absatz " + chapterId + " und gebe nur diesen als Antwort zurück. " +
      "Im neu generierten Text müssen die gleichen Charaktere vorkommen wie im alten."
    return chapterPrompt;
  }

  public generateCharacterDescriptionsPrompt(fullStory: string): string {
    // let characterPrompt = "Schreibe jeweils eine sehr bildlich beschreibende Characterbeschreibung für jeden Character in diesem Text:\n\n";
    let characterPrompt = "Search for each named character in the following text and look for parts, where the look of an character is described. \n"+
      "Then write a very descriptive character bio, which describes the character in a very visual way. Don't include any behavioral description or reference to the story plot in any way. But try to include everything that is mentioned in the story. \n\n";

    characterPrompt += fullStory + "\n\n\n";


    characterPrompt += "Use short sentences in english for your answer. Output the name of the character in square brackets, followed by the description. (e.g.: [Max] Tall boy with green eyes and blue hair)";
    return characterPrompt;
  }
}