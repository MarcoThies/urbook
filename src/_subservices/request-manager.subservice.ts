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
import { ICharacterList, INewChapter, IOpenAiStoryData, IStoryPrompts } from "./interfaces/story-data.interface";

@Injectable()
export class RequestManagerSubservice {

  constructor(
    private readonly logManager : DatabaseLoggerService,
    private readonly openAi : OpenAi,
    private readonly imageAPI : MidjourneyApiSubservice,
    private readonly dataManager : DataManagerService
  ) {}

  private chapterImageQueue = new RequestQueue();
  private abortFlag = false;

  public async requestStory(textPrompt: IOpenAiPromptMessage[], book : BooksEntity) : Promise<boolean | IOpenAiStoryData> {
    const chapterCount = book.parameterLink.topicChapterCount;
    await this.logManager.log(`Request new Story from Text-KI.`, __filename, "GENERATE", book);

    const structure = [
      {
        "name" : "create_child_story",
        "description" : "A full children's story with "+book.parameterLink.topicChapterCount+" paragraphs",
        "parameters" : {
          "type"  : "object",
          "properties" : {
            "title" : {
              "type" : "string",
              "description" : "A fitting title for the story"
            },
            "chapters" : {
              "type": "array",
              "description": "A list of text-paragraphs with as many entries as required chapters",
              "items": {
                "type": "string",
                "description": "A text paragraph of the story with a minimum of 60 words"
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
                    "description": "The name of the character found in the story. Not the type of animal or character just the plain name"
                  },
                  "info": {
                    "type": "string",
                    "description": "A very detailed description of the character found in the story. Describe in 100 words how you would imagine the character to look like."
                  }
                },
                "required" : ["name", "info"]
              }
            }
          },
          "required" : ["title", "chapters", "characters"]
        }
      }
    ]
    const textResult = await this.openAi.promptGPT35(textPrompt, structure);
    if(!textResult){
      await this.logManager.error("No result from text ai", __filename, "GENERATE", book);
      return false;
    }
    // Check results for plausibility
    const storyData = textResult as IOpenAiStoryData;
    if(storyData.title.length < 3){
      await this.logManager.error("Generated title is to short", __filename, "GENERATE", book);
      return false;
    }
    if(storyData.chapters.length !== chapterCount){
      await this.logManager.error(`Did not get right chapter count back ${storyData.chapters.length} != ${chapterCount}`, __filename, "GENERATE", book);
      return false;
    }else{
      // check if all chapters are long enough
      const minParaLength = Math.min( ...storyData.chapters.map((chapter) => {
        return chapter.length;
      }));
      if(minParaLength < 40) {
        await this.logManager.error(`One chapter didn't reach the required length: ${minParaLength}/40`, __filename, "GENERATE", book);
        return false;
      }
    }

    if(storyData.characters.length < 1){
      await this.logManager.error("Did not find any characters in the story", __filename, "GENERATE", book);
      return false;
    }else{
      const minCharLength = Math.min( ...storyData.characters.map((char) => {
        return char.info.length;
      }));
      if(minCharLength < 10) {
        await this.logManager.error(`One character info didn't reach the required length: ${minCharLength}/10`, __filename, "GENERATE", book);
        return false;
      }
    }

    await this.logManager.log("Story text generated", __filename, "GENERATE", book);

    return textResult as IOpenAiStoryData;
  }

  public async requestNewChapterText(textPrompt: IOpenAiPromptMessage[]) : Promise<boolean | string> {
    const structure = [
      {
        "name" : "regenerate_chapter",
        "description" : "Regenerated chapter for the existing story",
        "parameters" : {
          "type"  : "object",
          "properties" : {
            "new_chapter" : {
              "type": "string",
              "description": "One new paragraph for the existing story. It should match the length of the chapter it is trying to replace."
            }
          },
          "required" : ["new_chapter"]
        }
      }
    ];
    const textResult = await this.openAi.promptGPT35(textPrompt, structure);
    if(textResult === false){
      await this.logManager.log(`No result from text ai`, __filename, "REGENERATE");
      return false;
    }

    return (textResult as INewChapter).new_chapter as string;
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
          },
          "required" : ["charPrompts"]
        }
      }
    ]

    const textResult = await this.openAi.promptGPT35(characterAvatarPrompt, structure);
    if(textResult === false){
      return false;
    }

    return textResult as ICharacterList[];
  }


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

  public async requestStoryImages(book: BooksEntity, chapterId?:number) : Promise<boolean|ChapterEntity[]> {
    const chapters= (!chapterId) ? book.chapters : [book.chapters[chapterId]];

    await this.logManager.log(`Adding ${chapters.length} requests to MidJourney queue`, __filename, "GENERATE", book);

    for(let x in chapters) {
      this.chapterImageQueue.addJob(
        async() => await this.requestStoryImage(chapters[x]),
        async (imgUrl: string|boolean) => {

          // check if abort flag is set -> communicate to generator-subservice
          const bookState = await this.dataManager.getBookById(book.bookId);
          if(imgUrl === false || !bookState || bookState.state < 0) {
            this.abortFlag = true;
            console.log("aborted MidJourney-job in pipeline")
            return;
          }
          // safe image to entity
          chapters[x].imageUrl = imgUrl as string;
          await this.dataManager.updateChapter(chapters[x]);
          await this.logManager.log(`Saved MidJourney image`, __filename, "GENERATE", book);
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


  
}