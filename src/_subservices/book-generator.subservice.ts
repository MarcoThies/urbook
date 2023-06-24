import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { BooksEntity } from "./_shared/entities/books.entity";
import { DataManagerService } from "./_shared/data-manager.service";
import { TextPromptDesignerSubservice } from "./text-prompt-designer.subservice";
import { ImagePromptDesignerSubservice } from "./image-prompt-designer.subservice";
import { RequestManagerSubservice } from "./request-manager.subservice";
import { generateId } from "../_shared/utils";
import { CreateBookDto } from "../generate/dto/create-book.dto";
import { RegenerateChapterDto } from "../generate/dto/regenerate-chapter.dto";
import { ApiKeyEntity } from "./_shared/entities/api-keys.entity";
import { ParameterEntity } from "./_shared/entities/parameter.entity";
import { ChapterEntity } from "./_shared/entities/chapter.entity";
import { PdfGeneratorSubservice } from "./pdf-generator.subservice";
import { DatabaseLoggerService } from "./_shared/database-logger.service";
import { IImageAvatar } from "./interfaces/image-character-prompt.interface";
import { CharacterEntity } from "./_shared/entities/character.entity";
import { IOpenAiPromptMessage, messageRole } from "./interfaces/openai-prompt.interface";
import { ICharacterList, IOpenAiStoryData } from "./interfaces/story-data.interface";
import { reportUnhandledError } from "rxjs/internal/util/reportUnhandledError";

@Injectable()
export class BookGeneratorSubservice {
  constructor(
    private readonly dataManager: DataManagerService,
    private readonly logManager : DatabaseLoggerService,

    private readonly imagePromptDesigner: ImagePromptDesignerSubservice,
    private readonly textPromptDesigner: TextPromptDesignerSubservice,
    private readonly requestManager: RequestManagerSubservice,
    private readonly pdfGenerator: PdfGeneratorSubservice
  ) {}

  abortFlag = false;

  public async generateNewBook(createBookDto: CreateBookDto, user: ApiKeyEntity) : Promise<BooksEntity>{
    // begin Book generation Process
    this.abortFlag = false;

    const newBookId = generateId(3,4);
    const bookIdExists = await this.dataManager.getBookById(newBookId);
    if(bookIdExists) return await this.generateNewBook(createBookDto, user);

    await this.logManager.log(`Request new book: ${newBookId}`, __filename, "GENERATE", undefined, user);

    const demoTitle: string = `${createBookDto.child_name} - ${createBookDto.topic_specialTopic}`;

    // Generate new Book & Parameter entity-data-object
    const newBook = {
      bookId: newBookId,
      title: demoTitle,
      state: 1,
      apiKeyLink: user,
      parameterLink: {
        childName: createBookDto.child_name,
        childFavColor: createBookDto.child_favColor,
        childFavAnimal: createBookDto.child_favAnimals,
        childAge: createBookDto.child_age,
        childCountry: createBookDto.child_country,
        childLanguage: createBookDto.child_language,
        childGender: createBookDto.child_gender,
        topicMoralType: createBookDto.topic_moralType,
        topicChapterCount: createBookDto.topic_chapterCount,
        topicImageStyle: createBookDto.topic_imageStyle,
        topicSpecialTopic: createBookDto.topic_specialTopic
      } as ParameterEntity
    } as BooksEntity;

    const newBookEntry = await this.dataManager.saveNewBook(newBook);

    // do some async stuff with the new Book
    this.startGenerationPipeline(newBookEntry);

    return newBookEntry;
  }

  private async startGenerationPipeline(book: BooksEntity) {
    // 1. Generate Story from Book-Parameters
    await this.logManager.log(`Start book generation...`, __filename, "GENERATE", book);
    let storyPrompt: IOpenAiPromptMessage[] = this.textPromptDesigner.generateStoryPrompt(book.parameterLink);

    // 2. Generate Story from Story-Prompt
    const story: IOpenAiStoryData | boolean = await this.tryRepeat(
      async () => await this.requestManager.requestStory(storyPrompt, book),
      () => this.abortFlag
    );
    if(this.abortFlag){
      return;
    }
    if(story === false){
      await this.errorInPipeline(book);
      return;
    }

    const storyData = story as IOpenAiStoryData;
    book.title = storyData.title;

    // create db entities from paragraphs
    let chapterArr: ChapterEntity[] = []
    for(let x in storyData.chapters) {
      // 2.1 Save Chapters to DB
      chapterArr.push({
        paragraph: storyData.chapters[x].trim()
      } as ChapterEntity);
    }

    // set new Chapter content to book entity
    book.chapters = chapterArr;
    // update Book status 2 => Story generated | Now generating Characters-Descriptions
    book.state = 2;
    await this.dataManager.updateBookContent(book);

    // update Book status 3 => Character Descriptions done | Now generating Character Images
    // await this.dataManager.updateBookState(book, 3);

    // 5. Generate Character-Prompts from Character-Description
    let imageAvatars: IImageAvatar[] = [];
    for(let char of storyData.characters) {
      if(char.name.length > 0 && char.info.length > 0){
        imageAvatars.push({
          name: char.name,
          description: char.info
        } as IImageAvatar);
      }
    }
    if(imageAvatars.length === 0){
      // no characters found
      await this.logManager.log('Could not generate any character descriptions', __filename, "GENERATE", book);
      await this.errorInPipeline(book);
      return;
    }
    /*
    const imageAvatars: IImageAvatar[] = storyData.characters.map((char: ICharacterList) => {
      return {
        name: char.name,
        description: char.info
      } as IImageAvatar;
    });
   */
    const characterImagePrompts: boolean | IImageAvatar[] = await this.imagePromptDesigner.generateCharacterPrompts(imageAvatars as IImageAvatar[], book);
    if(this.abortFlag) {
      return;
    }
    if(characterImagePrompts === false){
      await this.logManager.log('Could not generate any character image prompts', __filename, "GENERATE", book);

      await this.errorInPipeline(book);
      return;
    }
    await this.logManager.log('Character image prompts accepted', __filename, "GENERATE", book);

    /*
    // 6. Request Avatar Images from Image AI
    const fullAvatarGroup: IImageAvatar[] = await this.requestManager.requestCharacterImages(characterImagePrompts);
    if(this.abortFlag) {
      return;
    }
    */

    // 7. Match Character-Entities to Chapters story -> Search
    const characterMap = new Map<string, CharacterEntity>();
    const chapters = book.chapters;
    for(let ind in chapters) {
      const currChapter = chapters[ind];

      // Search for each character Name in Chapter Text
      for(let n in characterImagePrompts as IImageAvatar[]) {
        const currAvatar = characterImagePrompts[n] as IImageAvatar;
        if(currChapter.paragraph.includes(currAvatar.name)) {
          // Character found in current Paragraph
          // Check if Character-Entity already exists
          let character = characterMap.get(currAvatar.name);

          if (!character) {
            // If not, create a new Character-Entity
            character = new CharacterEntity();
            // set currAvatar data to Character-Entity
            character = {...character, ...currAvatar};

            // Add the new Character-Entity to the Map
            characterMap.set(currAvatar.name, character);
          }

          // This will later be updated in database
          if (!currChapter.characters) {
            currChapter.characters = [];
          }
          currChapter.characters.push(character);
        }
      }
      // Save the updated Chapter-Entity to DB
      await this.dataManager.updateChapter(currChapter);
    }

    await this.logManager.log('Mapped characters to chapters', __filename, "GENERATE", book);

    // update Book status 4 => Character Avatars Done | Now generating Story Image Prompts
    if(this.abortFlag) {
      return;
    }
    await this.dataManager.updateBookState(book, 3);

    // 8. Generate Text-Prompt from Story-Image-Prompt
    // Create empty Image-Prompt-Group
    // const chapters = book.chapters;
    book.chapters = chapters;
    const chaptersWithPrompts = await this.imagePromptDesigner.addImagePromptsToChapter(book);
    if(this.abortFlag) {
      return;
    }
    if(chaptersWithPrompts === false){
      await this.errorInPipeline(book);
      return;
    }
    book.chapters = chaptersWithPrompts as ChapterEntity[];
    book.state = 4;
    await this.dataManager.updateBookContent(book);

    // 9. Request Story-Images from Image AI
    const chaptersWithImages : boolean|ChapterEntity[] = await this.requestManager.requestStoryImages(book);
    if(this.abortFlag) {
      return;
    }
    if(chaptersWithImages === false){
      await this.errorInPipeline(book);
      return;
    }
    book.chapters = chaptersWithImages as ChapterEntity[];
    book.state = 9;
    await this.dataManager.updateBookContent(book);

    await this.logManager.log('Chapter images generated', __filename, "GENERATE", book);

    // 10. Create Book PDF
    await this.pdfGenerator.createA5Book(book);
    await this.logManager.log('Generated PDF-File from book', __filename, "GENERATE", book);

    // update Book status 5 => Building Done
    await this.dataManager.updateBookState(book,  10);
  }

  // REGENERATE ONE CHAPTER CONTENT
  public async regenerateChapterText(regenerateChapterDto: RegenerateChapterDto, user: ApiKeyEntity): Promise<void> {
    const chapterId = regenerateChapterDto.chapterId - 1;
    const bookId = regenerateChapterDto.bookId;

    // get book if found and owned by user
    const book = await this.checkBookStatus(user, bookId, chapterId);

    // set Book state to regenerating Text
    await this.dataManager.updateBookState(book, 5);

    // make async call in bg to regenerate text
    this.asyncNewChapterPipeline(chapterId, book, user);
  }

  private async asyncNewChapterPipeline(chapterId: number, book: BooksEntity, user: ApiKeyEntity): Promise<void> {

    const storySuccess: boolean | string = await this.tryRepeat(
      async () => await this.newChapterText(chapterId, book, user),
      () => this.abortFlag
    );
    if(this.abortFlag){
      return;
    }

    const promptSuccess: boolean | string = await this.tryRepeat(
      async () => await this.newChapterPrompt(chapterId, book, user),
      () => this.abortFlag
    );
    if(this.abortFlag){
      return;
    }

    if(storySuccess === false || promptSuccess === false) {
      await this.errorInPipeline(book);
      return;
    }

    await this.dataManager.updateBookState(book, 9);

    // write new PDF-File
    await this.pdfGenerator.createA5Book(book);

    // set book state to done
    await this.dataManager.updateBookState(book, 10);
  }

  private async tryRepeat(callback: () => Promise<any>, abortFlag: () => boolean, try_count: number=4) : Promise<any>{
    let repeatSuccess = false;
    let tries = 0;
    while(!repeatSuccess) {
      repeatSuccess = await callback();

      if(abortFlag()){
        console.log("\nAbort flag has been triggered in TryRepeat function\n");
        return false;
      }

      if(tries > try_count) break;
      tries++;
    }
    return repeatSuccess;
  }

  private async newChapterText(chapterId: number, book: BooksEntity, user: ApiKeyEntity): Promise<boolean> {
    await this.logManager.log(`Regenerate chapter: ${chapterId+1}`, __filename, "REGENERATE", book, user);
    // re-assemble whole book text with paragraph numbers to be able to give it as context to AI for regeneration of chapter
    let bookText : string = book.chapters.map(( item, index ) =>  (index + 1) + ". " + item.paragraph ).join("\n");

    // get prompt for regenerating chapter
    const regenerationPrompt = this.textPromptDesigner.generateChapterTextPrompt(chapterId + 1, bookText)
    // generate new chapter text utilising prompt
    const newPara: string|boolean = await this.requestManager.requestNewChapterText(regenerationPrompt);
    if(newPara === false) {
      await this.logManager.log(`New chapter story text could not be generated: Chapter: ${chapterId+1}`, __filename, "REGENERATE", book, user);
      return false;
    }
    book.chapters[chapterId].paragraph = newPara as string;

    await this.dataManager.updateBookContent(book);
    await this.logManager.log(`New chapter text generated: ${newPara} - Chapter: ${chapterId+1}`, __filename, "REGENERATE", book, user);
    return true
  }

  private async newChapterPrompt(chapterId: number, book: BooksEntity, user: ApiKeyEntity): Promise<boolean> {
    // update book prompt for new chapter
    const newChapterWithPrompt: boolean | ChapterEntity[] = await this.imagePromptDesigner.addImagePromptsToChapter(book, chapterId);
    if(newChapterWithPrompt === false){
      await this.logManager.log(`New chapter prompt could not be generated: Chapter: ${chapterId+1}`, __filename, "REGENERATE", book, user);
      return false;
    }
    book.chapters[chapterId] = newChapterWithPrompt[0];

    await this.dataManager.updateBookContent(book);
    await this.logManager.log(`New chapter prompt generated: ${newChapterWithPrompt[0].prompt} - Chapter: ${chapterId+1}`, __filename, "REGENERATE", book, user);

    return true;
  }

  // REGENERATE ONE CHAPTER IMAGE
  public async regenerateChapterImage(regenerateChapterDto: RegenerateChapterDto, user: ApiKeyEntity): Promise<void> {
    const chapterId = regenerateChapterDto.chapterId - 1;
    const bookId = regenerateChapterDto.bookId;

    // get book if found and owned by user
    const book = await this.checkBookStatus(user, bookId, chapterId);

    // set Book state to regenerating Image
    await this.dataManager.updateBookState(book, 6);

    // make async call in bg to regenerate image
    await this.logManager.log(`Regenerating chapter ${chapterId+1} image`, __filename, "REGENERATE", book, user);
    // make async call in bg to regenerate text -> not async
    this.newChapterImage(chapterId, book);
  }

  private async newChapterImage(chapterId: number, book: BooksEntity): Promise<void> {
    // request new chapter image from image AI and save to DB

    await this.logManager.log(`Request new image for chapter: ${chapterId+1}`, __filename, "REGENERATE", book);
    const newChapterArray = await this.requestManager.requestStoryImages(book, chapterId);
    if(newChapterArray === false) {
      await this.errorInPipeline(book);
      return;
    }
    book.chapters[chapterId] = (newChapterArray as ChapterEntity[])[0];

    await this.logManager.log(`Regenerating PDF-file`, __filename, "REGENERATE", book);


    await this.dataManager.updateBookState(book, 9);
    await this.dataManager.updateBookContent(book);

    // write new PDF-File
    await this.pdfGenerator.createA5Book(book);

    await this.logManager.log(`PDF-file regenerated`, __filename, "REGENERATE",book);
    // set book state to done
    await this.dataManager.updateBookState(book, 10);
  }

  private async checkBookStatus(user: ApiKeyEntity, bookId: string, chapterId: number): Promise<BooksEntity>{
    // get book if found and owned by user
    const existingBook = await this.dataManager.getBookWithAccessCheck(user, bookId);
    // check if book is in state 10 (finished)
    if(existingBook.state < 10){
      throw new HttpException(`Book with id ${bookId} is still processing or aborted. Abort...!`, HttpStatus.CONFLICT);
    }
    // check if chapter exists
    if(typeof existingBook.chapters[chapterId] === "undefined") {
      await this.logManager.error(`Chapter with ID ${chapterId + 1} doesn't exist! - Book: ${existingBook.title} User: ${user.apiId}`, __filename, "STATUS", existingBook, user);
      throw new HttpException(`Chapter with ID ${chapterId + 1} doesn't exist!`, HttpStatus.CONFLICT);
    }

    return existingBook;
  }

  public async abort(bookId: string, user: ApiKeyEntity): Promise<Boolean> {
    // get book if found and owned by user
    const myBook = await this.dataManager.getBookWithAccessCheck(user, bookId);
    await this.logManager.log(`Trying to cancel job for book: ${myBook.bookId}`, __filename, "ABORT", myBook, user);

    // check if book is in state 10 (finished)
    if(myBook.state > 9 || myBook.state < 0){
      await this.logManager.log(`Could not abort job ${myBook.bookId}`, __filename, "CANCEL BOOK", myBook, user);
      throw new HttpException(`Generation of book with ID ${bookId} not running. Nothing to abort!`, HttpStatus.CONFLICT);
    }

    this.abortFlag = true;
    this.requestManager.clearQueues();

    await this.dataManager.updateBookState(myBook, -1);
    await this.logManager.log(`Cancel Job Book: ${myBook.bookId}`, __filename, "ABORT", myBook, user);

    return true;
  }

  private async errorInPipeline(book: BooksEntity){
    await this.logManager.log("Something went wrong. Book generation aborted.", __filename, "ABORT", book);
    await this.dataManager.updateBookState(book,-2);
  }

}