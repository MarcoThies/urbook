import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { IImageAvatar } from "./interfaces/image-character-prompt.interface";
import { ChapterEntity } from "./_shared/entities/chapter.entity";
import { DatabaseLoggerService } from "./_shared/database-logger.service";
import { RequestQueue } from "../_shared/request-queue";
import { MidjourneyApiSubservice } from "./rest-interfaces/midjourney-api.subservice";
import { DataManagerService } from "./_shared/data-manager.service";
import { OpenAi } from "./rest-interfaces/openai.subservice";
import { IOpenAiPromptMessage } from "./interfaces/openai-prompt.interface";
import { BooksEntity } from "./_shared/entities/books.entity";

@Injectable()
export class RequestManagerSubservice {

  constructor(
    private readonly logManager : DatabaseLoggerService,
    private readonly openAi : OpenAi,
    private readonly imageAPI : MidjourneyApiSubservice,
    private readonly dataManager : DataManagerService
  ) {}

  private avatarImageQueue = new RequestQueue();
  private chapterImageQueue = new RequestQueue();

  public bookRef: BooksEntity;

  public async requestStory(textPrompt: IOpenAiPromptMessage[], chapterCount : number) : Promise<string[][]> {
    this.logManager.log(`Request new Story from Text-KI.`, __filename, "GENERATE", undefined, this.bookRef);

    const textResult = await this.openAi.promptGPT35withContext(textPrompt);
    if(!textResult){
      const error = "No result from text ai";
      await this.logManager.error(error, __filename, "GENERATE", undefined, this.bookRef);
      throw new HttpException(error, HttpStatus.CONFLICT);
    }

    const result = this.dataFromAnswer(textResult as string);
    if (result.length != chapterCount) {
      await this.logManager.warn("Chapter count didn't match requirements", __filename, "GENERATE", undefined, this.bookRef);

      console.log("DEBUG requestManager.requestStory: Generated story didn't have the requested number of chapters.")
      return this.requestStory(textPrompt, chapterCount);
    }

    await this.logManager.log("Story text generated", __filename, "GENERATE", undefined, this.bookRef);

    return result;
  }

  public async requestNewChapterText(textPrompt: string, tempChapterId : number) : Promise<string> {

    await this.logManager.log(`Request new chapter text from Text-KI - tempChapterId: ${tempChapterId}`, __filename, "KI-TEXT");

    const textResult = await this.openAi.promptGPT35(textPrompt);
    if(!textResult){
      throw new HttpException("No result from text ai", HttpStatus.CONFLICT)
    }

    let splitData = this.dataFromAnswer(textResult as string);

    if(splitData.length === 1) return splitData[0][1];
    return textResult as string;
  }

  public async requestCharacterDescription(charactersPrompt: IOpenAiPromptMessage[]) : Promise<IImageAvatar[]> {
    await this.logManager.log("Request character description from text-ai", __filename, "GENERATE", undefined, this.bookRef);

    const textResult = await this.openAi.promptGPT35withContext(charactersPrompt);
    if(!textResult){
      await this.logManager.error("No answer from text ai", __filename, "GENERATE", undefined, this.bookRef);
      throw new HttpException("No result from text ai", HttpStatus.CONFLICT)
    }

    let splitData = this.dataFromAnswer(textResult as string);

    await this.logManager.log("Character descriptions generated", __filename, "GENERATE", undefined, this.bookRef);

    return splitData.map((char)=>{
      return {
        name: char[0].trim(),
        description: char[1].trim()
      } as IImageAvatar
    });

  }

  public async requestCharacterPromptsForImage(characterAvatarPrompt: IOpenAiPromptMessage[]) : Promise<string[][]> {
    const textResult = await this.openAi.promptGPT35withContext(characterAvatarPrompt);
    if(!textResult){
      this.logManager.error("No answer from text ai", __filename, "GENERATE", undefined, this.bookRef);
      throw new HttpException("No result from text ai", HttpStatus.CONFLICT)
    }

    return this.dataFromAnswer(textResult as string);
  }

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
    if(!prompt){
      this.logManager.error("No prompt for character image request", __filename, "GENERATE", undefined, this.bookRef);
      throw new HttpException("No Prompt for Image Request", HttpStatus.CONFLICT);
    }
    return await this.imageAPI.requestImage(prompt)
  }

  public async requestImagePromptsForImage(storyImagePromptPrompt: IOpenAiPromptMessage[]) : Promise<string[][]> {
    await this.logManager.log("Requesting prompts for story images", __filename, "GENERATE", undefined, this.bookRef);

    const textResult = await this.openAi.promptGPT35withContext(storyImagePromptPrompt);
    if(!textResult){
      await this.logManager.error("No prompt for story image request", __filename, "GENERATE", undefined, this.bookRef);
      throw new HttpException("No result from text ai", HttpStatus.CONFLICT)
    }
    await this.logManager.log("Got prompts for story images", __filename, "GENERATE", undefined, this.bookRef);
    return this.dataFromAnswer(textResult as string);
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

    const output = (result.length > 0) ? result : str.split("\n").map((val,ind) => [ind.toString(), val]);
    console.log(output);

    return output;
  }

  public async requestStoryImages(chapters: ChapterEntity[]) : Promise<ChapterEntity[]> {
    for(let x in chapters) {
      
      this.chapterImageQueue.addJob(
        async() => await this.requestStoryImage(chapters[x]),
        (imgUrl: string) => {
          // safe image
          chapters[x].imageUrl = imgUrl;
          this.dataManager.updateChapter(chapters[x]);
          this.logManager.log("Successfully received image from midjourney", __filename, "GENERATE", undefined, this.bookRef);
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