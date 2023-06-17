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

    const newTitle: string = `${createBookDto.child_name} - ${createBookDto.topic_specialTopic}`;

    // Generate new Book & Parameter entity-data-object
    const newBook = {
      isbn: newBookId,
      title: newTitle,
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
    const story: string[][] | boolean = await this.requestManager.requestStory(storyPrompt, book);
    if(story === false){
      await this.errorInPipeline(book);
      return;
    }

    if(this.abortFlag) {
      return;
    }

    // create db entities from paragraphs
    let chapterArr: ChapterEntity[] = []
    for(let x in story as string[][]) {
      // 2.1 Save Chapters to DB
      let chapter = story[x][1].trim();
      if (chapter.length < 1) {
        continue;
      }
      chapterArr.push({
        paragraph: chapter
      } as ChapterEntity);
    }

    // set new story answer to prompt conversation
    storyPrompt.push({
      role: messageRole.assistant,
      content: chapterArr.map((x) => x.paragraph).join("\n")
    });

    if(this.abortFlag) {
      return;
    }

    // set new Chapter content to book entity
    book.chapters = chapterArr;
    // update Book status 2 => Story generated | Now generating Characters-Descriptions
    book.state = 2; 
    await this.dataManager.updateBookContent(book);

    // 3.Generate Characters-Descriptions from Story
    const characterPrompt: IOpenAiPromptMessage = this.textPromptDesigner.generateCharacterDescriptionsPrompt();
    storyPrompt.push(characterPrompt);

    // 4. Generate Character-Description from Character-Prompt
    const imageAvatars: boolean|IImageAvatar[] = await this.requestManager.requestCharacterDescription(storyPrompt, book);
    if(imageAvatars === false){
      await this.errorInPipeline(book);
      return;
    }
    if(this.abortFlag) {
      return;
    }
    // update Book status 3 => Character Descriptions done | Now generating Character-Demo Images
    await this.dataManager.updateBookState(book, 3);

    // 5. Generate Character-Prompts from Character-Description
    const characterImagePrompts: boolean | IImageAvatar[] = await this.imagePromptDesigner.generateCharacterPrompts(imageAvatars as IImageAvatar[], book);
    if(characterImagePrompts === false){
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
      // TODO: change imageAvatars back to fullAvatarGroup
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

    // update Book status 4 => Character Avatars Done | Now generating Story Images
    if(this.abortFlag) {
      return;
    }
    await this.dataManager.updateBookState(book, 4);

    // 8. Generate Text-Prompt from Story-Image-Prompt
    // Create empty Image-Prompt-Group
    // const chapters = book.chapters;
    book.chapters = chapters;
    const chaptersWithPrompts = await this.imagePromptDesigner.addImagePromptsToChapter(book);
    if(chaptersWithPrompts === false){
      await this.errorInPipeline(book);
      return;
    }
    if(this.abortFlag) {
      return;
    }
    book.chapters = chaptersWithPrompts as ChapterEntity[];
    await this.dataManager.updateBookContent(book);

    // 9. Request Story-Images from Image AI
    const chaptersWithImages : boolean|ChapterEntity[] = await this.requestManager.requestStoryImages(book);
    if(chaptersWithImages === false){
      await this.errorInPipeline(book);
      return;
    }
    book.chapters = chaptersWithImages as ChapterEntity[];
    await this.dataManager.updateBookContent(book);

    await this.logManager.log('Chapter images generated', __filename, "GENERATE", book);

    if(this.abortFlag) {
      return;
    }

    await this.dataManager.updateBookState(book, 9);
    // 10. Create Book PDF
    await this.pdfGenerator.createA5Book(book);
    await this.logManager.log('Generated PDF-File from book', __filename, "GENERATE", book);

    // update Book status 5 => Building Done
    await this.dataManager.updateBookState(book,  10);
  }

  public async regenerateChapterText(regenerateChapterDto: RegenerateChapterDto, user: ApiKeyEntity): Promise<void> {
    const chapterId = regenerateChapterDto.chapterId - 1;
    const bookId = regenerateChapterDto.bookId;

    // get book if found and owned by user
    const book = await this.checkBookStatus(user, bookId, chapterId);

    // set Book state to regenerating Text
    await this.dataManager.updateBookState(book, 5);

    // make async call in bg to regenerate text
    await this.logManager.log(`Regenerating chapter ${chapterId+1}`, __filename, "REGENERATE", book, user);

    this.newChapterText(chapterId, book, user);
    // TODO: reload chapter-prompt for possible different image creation
  }

  private async newChapterText(chapterId: number, book: BooksEntity, user: ApiKeyEntity): Promise<void> {
    await this.logManager.log(`Regenerate chapter: ${chapterId+1}`, __filename, "REGENERATE", book, user);
    // re-assemble whole book text with paragraph numbers to be able to give it as context to AI for regeneration of chapter
    let bookText : string = book.chapters.map(( item, index ) => "[" + (index + 1) + "]" + item.paragraph ).join("\n\n");

    // get prompt for regenerating chapter
    const regenerationPrompt = this.textPromptDesigner.generateChapterTextPrompt(chapterId + 1, bookText)
    console.log("DBG1: " + chapterId + "   " + book.chapters[chapterId].paragraph);
    // generate new chapter text utilising prompt
    const newPara: string|boolean = await this.requestManager.requestNewChapterText(regenerationPrompt, chapterId);
    if(newPara === false) {
      await this.errorInPipeline(book);
      return;
    }
    book.chapters[chapterId].paragraph = newPara as string;

    await this.logManager.log(`New chapter text generated: ${newPara} - Chapter: ${chapterId+1}`, __filename, "REGENERATE", book, user);

    // generate new image prompt according to new chapter text
    const newChapter = await this.imagePromptDesigner.addImagePromptsToChapter(book, chapterId);
    book.chapters[chapterId] = newChapter[0];

    console.log("DBG3: " + book.chapters[0]);
    await this.dataManager.updateBookContent(book);
    // alter chapter text in book and update database entry
    book.state = 9; // set State to generate pdf
    await this.dataManager.updateBookContent(book);

    // write new PDF-File
    await this.pdfGenerator.createA5Book(book);

    // set book state to done
    await this.dataManager.updateBookState(book, 10);
  }

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

    book.state = 9; // set state to generate pdf
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
    existingBook.state = 10; //DBG
    if(existingBook.state < 10){
      throw new HttpException(`Book with ID ${bookId} is still processing. Abort...!`, HttpStatus.CONFLICT);
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
    await this.logManager.log(`Trying to cancel job for book: ${myBook.isbn}`, __filename, "ABORT", myBook, user);

    // check if book is in state 10 (finished)
    if(myBook.state > 9 || myBook.state < 0){
      await this.logManager.log(`Could not abort job ${myBook.isbn}`, __filename, "CANCEL BOOK", myBook, user);
      throw new HttpException(`Generation of book with ID ${bookId} not running. Nothing to abort!`, HttpStatus.CONFLICT);
    }

    this.abortFlag = true;
    this.requestManager.clearQueues();

    await this.dataManager.updateBookState(myBook, -1);
    await this.logManager.log(`Cancel Job Book: ${myBook.isbn}`, __filename, "ABORT", myBook, user);

    return true;
  }

  private async errorInPipeline(book: BooksEntity){
    await this.logManager.log("Something went wrong. Book generation aborted.", __filename, "ABORT", book);
    await this.dataManager.updateBookState(book,-2);
  }

}