import { ParameterEntity } from "./_shared/entities/parameter.entity";
import { Injectable } from "@nestjs/common";
import { IOpenAiPromptMessage, messageRole } from "./interfaces/openai-prompt.interface";

@Injectable()
export class TextPromptDesignerSubservice {
  constructor() {}

  public generateStoryPrompt(parameter: ParameterEntity): IOpenAiPromptMessage[] {
    // generate Text-Prompt from Child Parameters
    const paragraphCount = parameter.topicChapterCount;
    const avgWordsPerParagraph = 40
    let author : string = 'Lewis Carroll';

    const randomNumber = Math.floor(Math.random() * 5);
    switch(randomNumber) {
      case 0:
        author = 'Astrid Lindgren';
        break;
      case 1:
        author = 'Eric Carle';
        break;
      case 2:
        author = 'Dr. Seuss';
        break;
      case 3:
        author = 'Roald Dahl';
        break;
      case 4:
        author = 'Lewis Carroll';
        break;
    }


    const systemContent =
      "Antworte, als wärst du Kinderbuchautor/in " + author + ".\n" +

      "Bitte stelle sicher, dass die Geschichte altersgerecht und ansprechend ist, mit einer klaren Erzählung, die die gewählte Moral und das Thema beinhaltet. \n" +
      "Die Geschichte sollte auch Elemente enthalten, die die Interessen und Persönlichkeitsmerkmale meines Kindes widerspiegeln. \n" +
      "Erwähne sie aber nicht explizit, sondern richte die Geschichte geschickt an ihnen aus. Erwähne die Moral nicht öfter als ein mal. \n" +
      "Die Geschichte soll auch einen Dialog enthalten und einem roten Faden folgen.\n" +

      "Das Buch muss " + paragraphCount + " Absätze mit je  " + (avgWordsPerParagraph - 5) + " bis " + (avgWordsPerParagraph + 5) + "  Wörtern haben.";

      const userContent =
      "Hallo, ich suche ein personalisiertes Kinderbuch, das auf die Interessen und Persönlichkeit meines Kindes zugeschnitten ist. Hier sind einige Details über mein Kind:\n" +

      "Name: " + parameter.childName + "\n" +
      "Alter: " + parameter.childAge + "\n" +
      "Geschlecht: " + parameter.childGender + "\n" +
      "Ethnie: " + parameter.childCountry + "\n" +
      "Lieblingsfarbe: " + parameter.childFavColor + "\n" +
      "Lieblingstier/-charakter:: " + parameter.childFavAnimal + "\n" +
      "Die in der Geschichte zu vermittelnde Moral lautet: " + parameter.topicMoralType + "\n" +
      "Das Thema der Geschichte lautet: " + parameter.topicSpecialTopic + ".\n" +

      "Erwähne die Lieblingsfarbe und das Lieblingstier/-charakter im ersten Absatz nicht! \n" +
      "Achte auf eine ausreichende Länge der Absätze. \n";

      console.log(systemContent + "\n" + userContent);
    return [
        { role : messageRole.system , content : systemContent },
        { role : messageRole.user , content : userContent }
    ] as IOpenAiPromptMessage[] ;

  }

  public generateChapterTextPrompt(chapterId: number, currentStory: string): IOpenAiPromptMessage[] {
    // generate text prompt for regeneration of particular chapter
    const systemContent = "Gegeben ist die folgende Geschichte mit per [index] nummerierten Absätzen: \n" + currentStory;
    const userContent = "\nGeneriere einen neuen Text für Absatz " + chapterId + " und gebe nur diesen als Antwort zurück. " +
      "Im neu generierten Text müssen die gleichen Charaktere vorkommen wie im alten."
    return [
      { role : messageRole.system , content : systemContent },
      { role : messageRole.user , content : userContent } 
    ] as IOpenAiPromptMessage[] ;
  }

  public generateCharacterDescriptionsPrompt(): IOpenAiPromptMessage {
    let characterPrompt = "Search for each named character in your story and look for parts, where the look of a character is detailed. \n"+
      "Then write a very descriptive character bio, which describes the character in a very visual way. Don't include any behavioral description or reference to the story plot in any way. But try to include everything that is mentioned in the story. \n\n";

    characterPrompt += "Use short sentences in english for your answer. Output the name of the character in square brackets, followed by the description. (e.g.: [Max] Tall boy with green eyes and blue hair)";

    return {
      role: messageRole.user,
      content: characterPrompt
    }
  }
}