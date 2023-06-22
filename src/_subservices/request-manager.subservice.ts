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
import { ICharacterList, IOpenAiStoryData, IStoryPrompts } from "./interfaces/story-data.interface";

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
  private abortFlag = false;

  public bookRef: BooksEntity;

  public async requestStory(textPrompt: IOpenAiPromptMessage[], book : BooksEntity) : Promise<boolean | IOpenAiStoryData> {
    const chapterCount = book.parameterLink.topicChapterCount;
    await this.logManager.log(`Request new Story from Text-KI.`, __filename, "GENERATE", book);

    const structure = [
      {
        "name" : "create_child_story",
        "description" : "A full children's story with "+book.parameterLink.topicChapterCount+" chapters",
        "parameters" : {
          "type"  : "object",
          "properties" : {
            "title" : {
              "type" : "string",
              "description" : "A fitting title of the story"
            },
            "chapters" : {
              "type": "array",
              "description": "A list of paragraphs that make up the story",
              "items": {
                "type": "string",
                "description": "One paragraph of the story with at least 100 characters"
              }
            },
            "characters" : {
              "type": "array",
              "description": "A list of characters and their visual depiction",
              "items": {
                "type": "object",
                "properties": {
                  "name": {
                    "type": "string",
                    "description": "The name of the character"
                  },
                  "description": {
                    "type": "string",
                    "description": "A very detailed depiction of the character"
                  }
                }
              }
            }
          }
        }
      }
    ]
    const textResult = await this.openAi.promptGPT35(textPrompt, structure);
    if(!textResult){
      await this.logManager.error("No result from text ai", __filename, "GENERATE", book);
      return false;
    }

    return textResult as IOpenAiStoryData;

    /*
    const result = this.dataFromAnswer(textResult as string);

    if (result.length !== chapterCount) {
      await this.logManager.warn("Chapter count didn't match requirements... Regenerate", __filename, "GENERATE", this.bookRef);
      console.log("WARNING: requestManager.requestStory: Generated story didn't have the requested number of chapters.")
      return await this.requestStory(textPrompt, book);
    }

    await this.logManager.log("Story text generated", __filename, "GENERATE", book);

    return result;
   */
  }

  public async requestNewChapterText(textPrompt: IOpenAiPromptMessage[], tempChapterId : number) : Promise<boolean | string> {

    const textResult = await this.openAi.promptGPT35withContext(textPrompt);
    if(textResult === false){
      await this.logManager.log(`No result from text ai`, __filename, "REGENERATE");
      return false;
    }

    let splitData = this.dataFromAnswer(textResult as string);

    if(splitData.length === 1) return splitData[0][1];
    return textResult as string;
  }

  public async requestCharacterDescription(charactersPrompt: IOpenAiPromptMessage[], bookRef: BooksEntity) : Promise<boolean | IImageAvatar[]> {
    await this.logManager.log("Request character description from text-ai", __filename, "GENERATE", bookRef);

    const textResult = await this.openAi.promptGPT35withContext(charactersPrompt);
    if(!textResult){
      await this.logManager.error("No answer from text ai", __filename, "GENERATE", bookRef);
      return false;
    }

    let splitData = this.dataFromAnswer(textResult as string);

    await this.logManager.log("Character descriptions generated successfully", __filename, "GENERATE", bookRef);

    return splitData.map((char)=>{
      return {
        name: char[0].trim(),
        description: char[1].trim()
      } as IImageAvatar
    });
  }

  public async requestCharacterPromptsForImage(characterAvatarPrompt: IOpenAiPromptMessage[]) : Promise<boolean | ICharacterList[]> {
    const structure = [
      {
        "name" : "character_profile_prompts",
        "description" : "A list of image ai prompts for each character-profile",
        "parameters" : {
          "type"  : "object",
          "properties" : {
            "charPrompts" : {
              "type": "array",
              "description": "A list of prompts for each character",
              "items": {
                "type": "object",
                "properties": {
                  "name": {
                    "type": "string",
                    "description": "The name of the character"
                  },
                  "prompt": {
                    "type": "string",
                    "description": "A prompt for the image ai, that depicts the character"
                  }
                }
              }
            }
          }
        }
      }
    ]

    const textResult = await this.openAi.promptGPT35(characterAvatarPrompt, structure);
    if(textResult === false){
      return false;
    }

    return textResult as ICharacterList[];
  }

  /*
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
      await this.logManager.error("No prompt for character image request", __filename, "GENERATE", this.bookRef.apiKeyLink, this.bookRef);
      throw new HttpException("No Prompt for Image Request", HttpStatus.CONFLICT);
    }
    return await this.imageAPI.requestImage(prompt)
  }
  */
  public async requestImagePromptsForImage(storyImagePromptPrompt: IOpenAiPromptMessage[]) : Promise<boolean|string[]> {

    const structure = [
      {
        "name" : "story_image_prompts",
        "description" : "A list of image ai prompts for each chapter",
        "parameters" : {
          "type"  : "object",
          "properties" : {
            "chapterPrompts" : {
              "type": "array",
              "description": "A list of prompts for each chapter",
              "items": {
                "type": "string",
                "description": "A prompt for the image ai, that depicts the chapter"
              }
            }
          }
        }
      }
    ];
    const textResult = await this.openAi.promptGPT35(storyImagePromptPrompt, structure);
    if(!textResult){
      return false;
    }
    return (textResult as IStoryPrompts).chapterPrompts;
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

  public async requestStoryImages(book: BooksEntity, chapterId?:number) : Promise<boolean|ChapterEntity[]> {
    const chapters= (!chapterId) ? book.chapters : [book.chapters[chapterId]];

    await this.logManager.log(`Adding ${chapters.length} requests to MidJourney queue`, __filename, "GENERATE", book);

    for(let x in chapters) {
      this.chapterImageQueue.addJob(
        async() => await this.requestStoryImage(chapters[x]),
        (imgUrl: string|boolean) => {
          if(imgUrl === false) {
            this.abortFlag = true;
            return;
          }
          // safe image to entity
          chapters[x].imageUrl = imgUrl as string;
          this.dataManager.updateChapter(chapters[x]);
          this.logManager.log(`Saved MidJourney image`, __filename, "GENERATE", book);
        }
      );

    }
    await this.chapterImageQueue.onEmpty();

    // check if abort flag is set -> communicate to generator-subservice
    if(this.abortFlag){
      await this.logManager.log(`Aborting current MidJourney image requests in queue`, __filename, "GENERATE", book);
      return false;
    }

    await this.logManager.log(`Completed ${chapters.length} image requests successfully`, __filename, "GENERATE", book);
    return chapters;
  }

  public async requestStoryImage(chapter: ChapterEntity) : Promise<boolean|string> {
    const prompt = chapter.prompt;
    if(!prompt) return false;

    // check if abort flag is set -> abort next generation in pipeline
    if(this.abortFlag) return false;

    // add Job to queue
    return await this.imageAPI.requestImage(prompt);
  }

  public getCurrentRequestQueueLength(state : number) : number {
    switch (state) {
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