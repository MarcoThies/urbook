import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { IImageAvatar } from "./interfaces/image-character-prompt.interface";
import { ChapterEntity } from "./_shared/entities/chapter.entity";
import { DatabaseLoggerService } from "./_shared/database-logger.service";
import { RequestQueue } from "../_shared/request-queue";
import { MidjourneyApiSubservice } from "./rest-interfaces/midjourney-api.subservice";
import { DataManagerService } from "./_shared/data-manager.service";

@Injectable()
export class RequestManagerSubservice {

  constructor(
    private readonly logsManager : DatabaseLoggerService,
    private readonly imageAPI : MidjourneyApiSubservice,
    private readonly dataManager : DataManagerService
  ) {}

  private avatarImageQueue = new RequestQueue();
  private chapterImageQueue = new RequestQueue();


  private demoStoryResponse: string = "" +
    "Es war einmal eine kleine Insel namens Kunterbunt, auf der lebten Piraten. Eines Tages machten sich die mutigen Piratenkinder Tim und Mia auf den Weg zu einem geheimnisvollen Schatz. Sie segelten mit ihrem kleinen Boot über das funkelnde Meer, immer auf der Suche nach Abenteuern. Plötzlich entdeckten sie eine Flaschenpost, die am Strand angespült wurde. Neugierig öffneten sie die Flasche und lasen den Brief darin. Ein geheimnisvoller Hinweis führte sie zu einer versteckten Höhle auf einer nahen Insel.\n" +
    "\n" + "Als Tim und Mia die Höhle betraten, entdeckten sie einen Haufen funkelnder Goldmünzen. Aber neben dem Gold lag auch eine traurig dreinblickende Schildkröte. Die Piratenkinder merkten schnell, dass die Schildkröte in einem Netz gefangen war. Hier standen sie nun vor einer wichtigen Entscheidung. Sollten sie das Gold nehmen und die Schildkröte alleine zurücklassen oder sollten sie der Schildkröte helfen und das Gold zurücklassen?\n" +
    "\n" + "Der Drache war überrascht von der mutigen und ehrlichen Bitte der Piratenkinder. Er erkannte ihre Tapferkeit und ihren guten Charakter an und war bereit, den Schatz gerecht zu teilen. Tim und Mia waren überglücklich und bedankten sich beim Drachen. Sie verließen die Insel mit einem Teil des Schatzes und einem wertvollen Gegenstand, der ihnen an ihre aufregende Reise erinnerte.";


  public async requestStory(textPrompt: string) : Promise<string[]> {

    // Todo: Create Request and wait for response

    this.logsManager.log(`Request new Story from Text-KI.`);
    const fullTextReturn = this.demoStoryResponse;

    return fullTextReturn.split("\n");
  }

  public async requestNewChapterText(textPrompt: string, tempChapterId : number) : Promise<string> {

    this.logsManager.log(`Request new chapter text from Text-KI - tempChapterId: ${tempChapterId}`);
    // temp text generation
    const fullTextReturn = this.demoStoryResponse;
    const splittedTextReturn = fullTextReturn.split("\n");

    // temp cleanup for demo method
    let chapterArr: string[] = []
    for(let x in splittedTextReturn) {
      let chapter = splittedTextReturn[x].trim();
      if (chapter.length < 1) continue;
      chapterArr.push(chapter);
    }
    
    // return same chapter text as before but add " - regereated -" tag in the end, to identify it as regenerated
    return chapterArr[tempChapterId] + ' - regenerated -';
  }


  private demoCharacterisationResponse: string = ""+
    "[Tim]: Tim war ein kleiner Piratenjunge mit wilden, braunen Locken, die im Wind flatterten, während er auf dem Boot stand. Seine Augen leuchteten vor Abenteuerlust und seine braune Haut glänzte in der Sonne. Er trug ein zerfetztes, gestreiftes Hemd und eine abgenutzte Piratenhose, die von vielen vergangenen Entdeckungsreisen erzählte. Mit seinem mutigen Blick und einem frechen Grinsen auf den Lippen war er stets bereit, sich den Gefahren der Meere zu stellen.\n\n" +
    "[Mia]: Mia war ein kleines Piratenmädchen mit langen, kastanienbraunen Haaren, die in sanften Wellen über ihre Schultern fielen. Ihre Augen hatten die Farbe des Ozeans, und ihre Gesichtsfarbe zeugte von vielen Tagen unter der Sonne. Mia trug eine verzierte Piratenbluse und eine knielange Hose mit unzähligen Taschen, in denen sie ihre Schätze aufbewahrte. Ihr zartes Lächeln verriet ihre fröhliche und abenteuerliche Natur, und ihre kleinen Hände waren immer bereit, sich in jede Herausforderung zu stürzen.\n\n" +
    "Die Charaktere in diesem Absatz sind Tim und Mia. Tim wird als abenteuerlustig, mutig und frech beschrieben, während Mia als fröhlich, abenteuerlustig und geschickt dargestellt wird. Ihre physischen Merkmale wie Haarfarbe, Augenfarbe und Hautfarbe werden hervorgehoben, um den Lesern ein lebhaftes Bild von den Charakteren zu vermitteln. Ihre Kleidung und ihre Körperhaltung geben einen weiteren Einblick in ihre Persönlichkeiten und ihren Piratenlebensstil.";

  public async requestCharacterDescription(charactersPrompt: string) : Promise<IImageAvatar[]> {

    // Todo: Create Request and wait for response

    this.logsManager.log("Request Character Description from Text-KI");

    const requestReturn = this.demoCharacterisationResponse;
    // clean outpout

    let splitData = this.dataFromAnswer(requestReturn);

    const characterArray: IImageAvatar[] = splitData.map((char)=>{
      return {
        name: char[0].trim(),
        description: char[1].trim()
      } as IImageAvatar
    });

    return characterArray;
  }

  private demoCharacterImagePromptResponse: string = ""+
    "Sicher, ich werde nun für Tim und Mia jeweils einen Prompt erstellen, basierend auf den bereitgestellten Charakterbeschreibungen und den gegebenen Anweisungen:\n\n" +
    "Für Tim:\n" +
    "[Tim] \"pirate boy:30, wild brown curls:25, windswept, eyes:20, glowing with adventure, sun-kissed skin, ragged striped shirt:15, worn-out pirate pants, brave gaze, mischievous grin, ready to face sea dangers, comic style, high detail --ar 1:1 --niji 5 --style expressive\"\n\n" +
    "Für Mia:\n" +
    "[Mia] \"pirate girl:30, long chestnut hair:25, ocean-colored eyes:20, sun-tanned face, ornate pirate blouse:15, knee-length pants with pockets, gentle smile, joyful adventurous nature, small hands ready for challenges, comic style, high detail --ar 1:1 --niji 5 --style expressive\"";
  public async requestCharacterPromptsForImage(characterAvatarPrompt: string) : Promise<string[][]> {
    // Todo: Create Request and wait for response
    const requestReturn = this.demoCharacterImagePromptResponse;

    return this.dataFromAnswer(requestReturn);
  }

  private demoImages= [
    "https://cdn.discordapp.com/attachments/1099720790330585188/1108425206596390962/Storgi_pirate_boy30_wild_brown_curls25_windswept_eyes20_glowing_00fea585-cab3-4da2-bdfa-abd49b5db026.png",
    "https://cdn.discordapp.com/attachments/1099720790330585188/1108430341053632672/Storgi_pirate_girl30_long_chestnut_hair25_ocean-colored_eyes20__443ae9ba-ed9f-4b0d-88f7-d8439a66a72d.png"
  ];
  public async requestCharacterImages(AvatarList: IImageAvatar[]) : Promise<IImageAvatar[]> {

    for(let x in AvatarList) {

      this.avatarImageQueue.addJob(
        async () => await this.requestCharacterImage(AvatarList[x]),
         (imageURL: string) => {
            // safe character Image to DB
           AvatarList[x].avatarUrl = imageURL;
        }
      );
    }
    await this.avatarImageQueue.onEmpty();
    return AvatarList;
  }

  public async requestCharacterImage(avatar: IImageAvatar) : Promise<string> {
    const prompt = avatar.prompt;
    if(!prompt) throw new HttpException("No Prompt for Image Request", HttpStatus.CONFLICT);
    return await this.imageAPI.requestImage(prompt)
  }


  private demoImagePromptsResponse: string = ""+
    "[1] \"Colorful::30 island, pirates, children adventurers, little boat, sparkling::25 sea, adventure search, bottle message on the beach, hidden cave on nearby island --ar 2:1 --niji 5 --style expressive\"\n\n" +
    "[2] \"Entering cave, heap of sparkling::30 gold coins, sad::20 turtle in net, decision, gold or rescue turtle --ar 2:1 --niji 5 --style expressive\"\n\n" +
    "[3] \"Surprised dragon, brave and honest request, shared treasure, joyous pirate children, leaving island, treasure reminder of adventure --ar 2:1 --niji 5 --style expressive\"";
  public async requestImagePromptsForImage(storyImagePromptPrompt: string) : Promise<string[][]> {
    // Todo: Create Request and wait for response
    const requestReturn = this.demoImagePromptsResponse;

    return this.dataFromAnswer(requestReturn);
  }

  // Some helper function to extract important data from the AIs response
  private dataFromAnswer(str: string) : string[][] {
    let result: string[][] = [];
    let offset = 0;

    while(true){
      const nextCharacterPrompt = str.indexOf("[", offset);
      if(nextCharacterPrompt < 0) break;

      let nextCharacterNameEnd = str.indexOf("]", nextCharacterPrompt+1);


      const paragrapghEnd = str.indexOf("\n", nextCharacterNameEnd+1);

      const endPointer = paragrapghEnd < 0 ? str.length : paragrapghEnd;

      const IndexValue = str.substring(nextCharacterPrompt + 1, nextCharacterNameEnd).trim();
      // check if next space is within range -> set character end to next space
      const nextSpace = str.indexOf(" ", nextCharacterNameEnd+1);
      if(nextSpace >= 0 && nextSpace - nextCharacterNameEnd < 3) {
        nextCharacterNameEnd = nextSpace;
      }

      const Value = str.substring(nextCharacterNameEnd + 1, endPointer).trim();
      result.push([IndexValue, Value.replace(/"/g, "")]);

      if(paragrapghEnd < 0) break;

      offset = paragrapghEnd;
    }
    return result;
  }


  public async requestStoryImages(chapters: ChapterEntity[]) : Promise<ChapterEntity[]> {
    for(let x in chapters) {
      
      this.chapterImageQueue.addJob(
        async() => await this.requestStoryImage(chapters[x]),
        (imgUrl: string) => {
          // safe image
          chapters[x].imageUrl = imgUrl;
          this.dataManager.updateChapter(chapters[x]);
        }
      );

    }
    await this.chapterImageQueue.onEmpty();
    return chapters;
  }

  public async requestStoryImage(chapter: ChapterEntity) : Promise<string> {
    const prompt = chapter.prompt;
    if(!prompt) throw new HttpException("No Prompt for Image Request", HttpStatus.CONFLICT);
    // add Job to queue
    return await this.imageAPI.requestImage(prompt);
  }

  public getCurrentRequestQueueLength(state : number) : number {
    switch (state) {
      case 10 : return 0;
      case 3  : return this.avatarImageQueue.length;
      case 4  : return this.chapterImageQueue.length;
      default : return 0;
    }
  }

  public clearQueues() {
    this.avatarImageQueue.clearQueue();
    this.chapterImageQueue.clearQueue();
  }
  
}