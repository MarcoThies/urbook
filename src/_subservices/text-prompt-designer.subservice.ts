import { ParameterEntity } from "./_shared/entities/parameter.entity";
import { Injectable } from "@nestjs/common";
import { IOpenAiPromptMessage, messageRole } from "./interfaces/openai-prompt.interface";

@Injectable()
export class TextPromptDesignerSubservice {
  constructor() {}

  public generateStoryPrompt(parameter: ParameterEntity): IOpenAiPromptMessage[] {
    console.log(parameter);

    // generate Text-Prompt from Child Parameters
    const paragraphCount = parameter.optChapterCount;
    const avgWordsPerParagraph = 60;
    let author : string = 'Lewis Carroll';
    let moral : string = "Freundschaft";

    const randomNumber = Math.floor(Math.random() * 5);
    switch(randomNumber) {
      case 0:
        author = 'Astrid Lindgren';
        moral = "Freundschaft ist sehr wichtig";
        break;
      case 1:
        author = 'Eric Carle';
        moral = "Anderen zu helfen ist erfüllend";
        break;
      case 2:
        author = 'Dr. Seuss';
        moral = "Ehrlichkeit währt am längsten";
        break;
      case 3:
        author = 'Roald Dahl';
        moral = "Jeder ist seiens eigenen Glückes Schmied";
        break;
      case 4:
        author = 'Lewis Carroll';
        moral = "Es ist noch kein Meister vom Himmel gefallen";
        break;
    }

    const systemContent =
      "Antworte, als wärst du Kinderbuchautor/in " + author + ".\n" +

      "Bitte stelle sicher, dass die Geschichte kindergerecht und ansprechend ist, mit einer klaren Erzählung, die die gewählte Moral und das Thema beinhaltet. \n" +
      "Die Geschichte sollte auch Elemente enthalten, die die gefragten Details widerspiegeln. \n" +
      "Erwähne sie aber nicht explizit, sondern richte die Geschichte geschickt an ihnen aus. Erwähne die Moral nicht öfter als ein mal. \n" +
      "Die Geschichte soll auch einen Dialog enthalten und einem roten Faden folgen."+
      "\n\n" +
      "Eine Geschichte besteht immer aus einem Titel und mehreren Paragraphen Text.\n" +
      "Außerdem gehört zu jeder Geschichte eine Liste mit auftretenden Characteren jeweils mit einer bildlichen Beschreibung.\n" +
      "Die Character-Beschreibung sollte sehr genau auf das Aussehen, Kleidung und Außenwirkung des jeweiligen Characters eingehen.";

    let userContent =
    "Generiere mir ein personalisiertes Kinderbuch, das auf die Interessen und Persönlichkeit meines Kindes zugeschnitten ist. \n" +
    "Das Buch muss " + paragraphCount + " Paragraphen mit je mindestens " + avgWordsPerParagraph + " Wörtern haben (mindestens zwei volle Sätze). \n" +
    "Hier sind Details über den Hauptcharakter des Buchs und weitere Details, die in der Geschichte vorkommen sollen:\n\n" +

    "Daten zum Hauptcharakter: \n" +
    "- Name: " + parameter.charName + "\n" +
    "- Alter: " + parameter.charAge + "\n" +
    "- Geschlecht: " + parameter.charGender + "\n";

    if(parameter.optColor) userContent += "- Lieblingsfarbe: " + parameter.optColor + "\n\n";

    userContent += "Daten zur Geschichte: \n";

    if(parameter.optTopic) userContent += "- Thema der Geschichte: " + parameter.optTopic + "\n";
    if(parameter.optSidekick) userContent += "- Nebencharakter der Geschichte: " + parameter.optSidekick + "\n";
    if(parameter.optPlace) userContent += "- Schauplatz: " + parameter.optPlace + "\n";

    if(parameter.optMoral) userContent += "- Moral der Geschichte: " + parameter.optMoral + "\n";
    else userContent += "- Moral der Geschichte: " + moral + "\n";

    userContent += "\n"+
    "Erwähne die Lieblingsfarbe nicht im ersten Absatz! \n" +
    "Achte auf eine ausreichende Länge der Absätze. (Wie gesagt, mindestens "+ avgWordsPerParagraph +" Wörter pro Paragraph)";

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

}