import { Injectable } from "@nestjs/common";
import { IImageAvatar } from "./interfaces/image-character-prompt.interface";
import { ChapterEntity } from "../generate/entities/chapter.entity";
import { DatabaseLoggerService } from "../_shared/database-logger.service";
import { RequestQueue } from "../_core/request-queue";
import { BooksEntity } from "../_shared/entities/books.entity";

@Injectable()
export class RequestManagerSubservice {

  constructor(
    private readonly logsManager : DatabaseLoggerService
  ) {}

  avatarImageQueue = new RequestQueue();
  chapterImageQueue = new RequestQueue();

  private demoStoryResponse: string = "" +
    "Es war einmal eine kleine Insel namens Kunterbunt, auf der lebten Piraten. Eines Tages machten sich die mutigen Piratenkinder Tim und Mia auf den Weg zu einem geheimnisvollen Schatz. Sie segelten mit ihrem kleinen Boot über das funkelnde Meer, immer auf der Suche nach Abenteuern. Plötzlich entdeckten sie eine Flaschenpost, die am Strand angespült wurde. Neugierig öffneten sie die Flasche und lasen den Brief darin. Ein geheimnisvoller Hinweis führte sie zu einer versteckten Höhle auf einer nahen Insel.\n" +
    "\n" + "Als Tim und Mia die Höhle betraten, entdeckten sie einen Haufen funkelnder Goldmünzen. Aber neben dem Gold lag auch eine traurig dreinblickende Schildkröte. Die Piratenkinder merkten schnell, dass die Schildkröte in einem Netz gefangen war. Hier standen sie nun vor einer wichtigen Entscheidung. Sollten sie das Gold nehmen und die Schildkröte alleine zurücklassen oder sollten sie der Schildkröte helfen und das Gold zurücklassen?\n" +
    "\n" + "Tim und Mia entschieden sich, der Schildkröte zu helfen. Gemeinsam schnitten sie vorsichtig das Netz auf und befreiten das hilflose Tier. Die Schildkröte bedankte sich mit einem fröhlichen Kopfnicken und erzählte den Piratenkindern von einem weiteren Schatz, der noch viel größer war als der, den sie gefunden hatten. Doch dieser Schatz gehörte einem gefährlichen Drachen, der auf einer einsamen Insel lebte.\n" +
    "\n" + "Die Piratenkinder überlegten lange, ob sie den gefährlichen Drachen herausfordern sollten. Schließlich entschieden sie sich dafür, das Abenteuer anzunehmen. Sie segelten mit ihrer kleinen Crew zur Insel des Drachen und wurden mit einem imposanten Anblick konfrontiert. Der Drache lag vor ihnen und bewachte einen riesigen Schatz.\n" +
    "\n" + "Wieder einmal standen Tim und Mia vor einer wichtigen Entscheidung. Sollten sie versuchen, den Schatz zu stehlen und zu fliehen oder sollten sie versuchen, mit dem Drachen zu verhandeln und eine friedliche Lösung zu finden? Nach einer kurzen Beratung beschlossen sie, den Drachen anzusprechen und um eine faire Aufteilung des Schatzes zu bitten.\n" +
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
    "[Tim] \"pirate boy:30, wild brown curls:25, windswept, eyes:20, glowing with adventure, sun-kissed skin, ragged striped shirt:15, worn-out pirate pants, brave gaze, mischievous grin, ready to face sea dangers, comic style, high detail --ar 2:1 --niji 5 --style scenic\"\n\n" +
    "Für Mia:\n" +
    "[Mia] \"pirate girl:30, long chestnut hair:25, ocean-colored eyes:20, sun-tanned face, ornate pirate blouse:15, knee-length pants with pockets, gentle smile, joyful adventurous nature, small hands ready for challenges, comic style, high detail --ar 2:1 --niji 5 --style scenic\"";
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
      this.avatarImageQueue.addJob(async () => await this.requestCharacterImage(AvatarList[x]));
    }
    await this.avatarImageQueue.runNextJob();
    return AvatarList;
  }

  public async requestCharacterImage(avatar: IImageAvatar) : Promise<IImageAvatar> {
    avatar.avatarUrl = (avatar.name === "Tim") ? this.demoImages[0] : this.demoImages[1];
    return avatar;
  }


  private demoImagePromptsResponse: string = ""+
    "[1] \"Colorful::30 island, pirates, children adventurers, little boat, sparkling::25 sea, adventure search, bottle message on the beach, hidden cave on nearby island --ar 1:2 --niji 5 --style scenic\"\n\n" +
    "[2] \"Entering cave, heap of sparkling::30 gold coins, sad::20 turtle in net, decision, gold or rescue turtle --ar 1:2 --niji 5 --style scenic\"\n\n" +
    "[3] \"Rescuing::25 turtle, cutting net, grateful turtle, tale of bigger treasure, dangerous dragon, lonely island --ar 1:2 --niji 5 --style scenic\"\n\n" +
    "[4] \"Pirate children, challenging dragon, small crew, sailing to dragon's island, guarding massive treasure --ar 1:2 --niji 5 --style scenic\"\n\n" +
    "[5] \"Important decision, steal treasure or negotiate, peaceful::25 resolution, speaking to dragon, fair share of treasure --ar 1:2 --niji 5 --style scenic\"\n\n" +
    "[6] \"Surprised dragon, brave and honest request, shared treasure, joyous pirate children, leaving island, treasure reminder of adventure --ar 1:2 --niji 5 --style scenic\"";
  public async requestImagePromptsForImage(storyImagePromptPrompt: string) : Promise<string[][]> {
    // Todo: Create Request and wait for response
    const requestReturn = this.demoImagePromptsResponse;

    return this.dataFromAnswer(requestReturn);
  }

  // Some helper function to extract important data from the AIs response
  private dataFromAnswer(str: string) : string[][] {
    let result: string[][] = [];
    let offset = 0;
    let timeout = 100;

    while(timeout > 0){
      const nextCharacterPrompt = str.indexOf("[", offset);
      if(nextCharacterPrompt < 0) break;

      let nextCharacterNameEnd = str.indexOf("]", nextCharacterPrompt+1)

      const paragrapghEnd = str.indexOf("\n", nextCharacterNameEnd+1);

      const endPointer = paragrapghEnd < 0 ? str.length : paragrapghEnd;

      const IndexValue = str.substring(nextCharacterPrompt + 1, nextCharacterNameEnd).trim();

      // check if there is a ":" after the brackets
      const nextColon = str.indexOf(":", nextCharacterNameEnd+1);
      if(nextColon > 0){
        if(nextCharacterNameEnd+1 - nextColon < 2) {
          // colon in proximity to brackets, so we skip this one
          nextCharacterNameEnd = nextColon;
        }
      }

      const Value = str.substring(nextCharacterNameEnd + 1, endPointer).trim();
      result.push([IndexValue, Value.replace(/"/g, "")]);

      if(paragrapghEnd < 0) break;

      offset = paragrapghEnd;
      timeout--;
    }
    return result;
  }


  private demoStoryImages = [
    "https://media.discordapp.net/attachments/1099720790330585188/1108529721957945534/Storgi_Colorful_f577b6ca-8ba2-4c22-a7a5-42fc0bf9a48d.png?width=3072&height=1537",
    "https://media.discordapp.net/attachments/1099720790330585188/1108529842661642361/Storgi_Entering_cave_heap_of_sparkling_81686cf0-7a5b-4bec-8aeb-50a9b2067bf7.png?width=3072&height=1537",
    "https://media.discordapp.net/attachments/1099720790330585188/1108530558948089976/Storgi_Pirate_children_challenging_dragon_small_crew_sailing_to_b9fd36c6-ae72-4971-a2e0-2895c197fc47.png?width=3072&height=1537",
    "https://media.discordapp.net/attachments/1099720790330585188/1108530706436591656/Storgi_Important_decision_steal_treasure_or_negotiate_peaceful_1251235a-5fc6-4b18-b32f-679d1005c885.png?width=3072&height=1537",
    "https://media.discordapp.net/attachments/1099720790330585188/1108530779237142610/Storgi_Surprised_dragon_brave_and_honest_request_shared_treasur_95912075-4f77-43f5-925a-b490f470e520.png?width=3072&height=1537",
    "https://media.discordapp.net/attachments/1099720790330585188/1108531516260221008/Storgi_Important_lesson_value_beyond_treasures_helping_others_g_b9752ec2-4851-4bd9-9281-ab43a8865539.png?width=3072&height=1537"
  ]
  public async requestStoryImages(chapters: ChapterEntity[]) : Promise<ChapterEntity[]> {
    for(let x in chapters) {
      
      this.chapterImageQueue.addJob(async() => await this.requestStoryImage(chapters[x], x));
    }
    await this.chapterImageQueue.runNextJob();
    return chapters;
  }

  public async requestStoryImage(chapter: ChapterEntity, chapterId) : Promise<ChapterEntity> {
    chapter.imageUrl = this.demoStoryImages[chapterId];
    return chapter;
  }

  public getCurrentRequestQueueLength(book : BooksEntity) : number {
    switch (book.state) {
      case 10 : {return 0;}
      case 3  : {return this.avatarImageQueue.getCurrentQueueLength();}
      case 4  : {return this.chapterImageQueue.getCurrentQueueLength();}
      default : {return 0;}
    }
  }

  public clearQueues() {
    this.avatarImageQueue.clearQueue();
    this.chapterImageQueue.clearQueue();
  }
  
}