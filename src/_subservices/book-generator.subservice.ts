import { NotFoundException } from "@nestjs/common";
import { BooksEntity } from "../_shared/entities/books.entity";
import { DataManagerSubservice } from "./data-manager.subservice";
import { TextPromptDesignerSubservice } from "./text-prompt-designer.subservice";
import { ImagePromtDesignerSubservice } from "./image-promt-designer.subservice";
import { RequestManagerSubservice } from "./request-manager.subservice";
import { generateId } from "../_shared/utils";
import { CreateBookDto } from "../generate/dto/create-book.dto";
import { RegenerateChapterDto } from "../generate/dto/regenerate-chapter.dto";
import { ApiKeyEntity } from "../_shared/entities/api-keys.entity";
import { ParameterEntity } from "../generate/entities/parameter.entity";
import { Injectable } from "@nestjs/common";
import { ChapterEntity } from "../generate/entities/chapter.entity";
import { CharacterEntity } from "../generate/entities/character.entity";
import { IImageAvatar } from "./interfaces/image-character-prompt.interface copy";

@Injectable()
export class BookGeneratorSubservice {
  constructor(
    private readonly dataManager: DataManagerSubservice,
    private readonly imagePromptDesigner: ImagePromtDesignerSubservice,
    private readonly textPromtDesigner: TextPromptDesignerSubservice,
    private readonly requestManager: RequestManagerSubservice
  ) {}

  public async generateNewBook(createBookDto: CreateBookDto, user: ApiKeyEntity) : Promise<BooksEntity>{
    // begin Book generation Process
    const newBookId = generateId(3,4);

    const bookIdExists = await this.dataManager.getBookById(newBookId);
    if(bookIdExists) return await this.generateNewBook(createBookDto, user);

    // Generate new Book & Parameter entity-data-object
    const newBook = {
      isbn: newBookId,
      title: "myBook Title",
      state: 1,
      apiKeyLink: user
    } as BooksEntity;

    const newParameter = {
      childName: createBookDto.child_name
    } as ParameterEntity;

    const newBookEntry = await this.dataManager.saveNewBook(newBook, newParameter);

    // do some async stuff with the new Book
    this.startGenerationPipeline(newBookEntry);

    return newBookEntry;
  }

  private async startGenerationPipeline(book: BooksEntity) {
    // 1. Generate Story from Book-Parameters
    const storyPrompt: string = this.textPromtDesigner.generateStoryPrompt(book.parameterLink);

    // 2. Generate Story from Story-Prompt
    const story: string[] = await this.requestManager.requestStory(storyPrompt);

    // create db entities from paragraphs
    let chapterArr: ChapterEntity[] = []
    for(var x in story) {
      // 2.1 Save Chapters to DB
      let chapter = story[x].trim();
      if (chapter.length < 1) continue;
      chapterArr.push({
        paragraph: chapter
      } as ChapterEntity);
    }
    // set new Chapter content to book entity
    book.chapters = chapterArr;
    // update Book status 2 => Story generated | Now generating Characters-Descriptions
    book.state = 2;
    await this.dataManager.updateBookContent(book);

    // 3.Generate Characters-Descriptions from Story
    const characterPrompt: string = this.textPromtDesigner.generateCharacterDescriptionsPrompt(story.join("\n"));

    // 4. Generate Character-Description from Character-Prompt
    const imageAvatars: IImageAvatar[] = await this.requestManager.requestCharacterDescription(characterPrompt);

    // update Book status 3 => Character Descriptions done | Now generating Character-Demo Images
    await this.dataManager.updateBookState(book, 3);

    // 5. Generate Character-Prompts from Character-Description
    const characterImagePrompts: IImageAvatar[] = await this.imagePromptDesigner.generateCharacterPrompts(imageAvatars);

    // 6. Request Avatar Images from Image AI
    const fullAvatarGroup: IImageAvatar[] = await this.requestManager.requestCharacterImage(characterImagePrompts);

    // 7. Match Character-Entities to Chapters story -> Search
    const characterMap = new Map<string, CharacterEntity>();
    const chapters = book.chapters;
    for(var ind in chapters) {
      const currChapter = chapters[ind];

      // Search for each character Name in Chapter Text
      for(var n in fullAvatarGroup) {
        const currAvatar = fullAvatarGroup[n];
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

    // update Book status 4 => Character Avatars Done | Now generating Story Images
    await this.dataManager.updateBookState(book, 4);

    // 8. Generate Text-Prompt from Story-Image-Prompt
    // Create empty Image-Prompt-Group
    book.chapters =  await this.imagePromptDesigner.generateStoryImages(chapters);
    await this.dataManager.updateBookContent(book);

    // 9. Request Story-Images from Image AI
    book.chapters = await this.requestManager.requestStoryImages(book.chapters);
    await this.dataManager.updateBookContent(book, true);

    // update Book status 5 => Building Done
    await this.dataManager.updateBookState(book,  10);

  }

  // Not used yet, might be able to delete after team meeting 22.5 
  private async mapCharactersToChapter(chapters : ChapterEntity[], fullAvatarGroup : IImageAvatar[]) {

    const characterMap = new Map<string, CharacterEntity>();
    for(var ind in chapters) {
      const currChapter = chapters[ind];

      // Search for each character Name in Chapter Text
      for(var n in fullAvatarGroup) {
        const currAvatar = fullAvatarGroup[n];
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
  }

  public async regenerateChapterText(regenerateChapterDto: RegenerateChapterDto, user: ApiKeyEntity): Promise<BooksEntity> {
    const book = await this.dataManager.getBookById(regenerateChapterDto.bookId);
    if(!book) new NotFoundException(`Book with ID ${regenerateChapterDto.bookId} not found!`)
    const chapterId = regenerateChapterDto.chapterId;
    var bookChapters = book.chapters;

    // reassamble whole book text with paragraph numbers to be able to give it as context to AI for regeneration of chapter
    var bookText : string = '';
    for (var index in bookChapters) {
      bookText.concat('\n[', index, '] \n');
      bookText.concat(bookChapters[index].paragraph);
    }

    // get prompt for regenerating chapter
    const regenerationPrompt = await this.textPromtDesigner.generateChapterTextPrompt(chapterId, bookText)

    // generate new chapter text utilising prompt
    const newChapterText = await this.requestManager.requestNewChapterText(regenerationPrompt, chapterId);

    // alter chapter text in book and update database entry 
    book.chapters[chapterId].paragraph = newChapterText;
    return await this.dataManager.updateBookContent(book, true);

    // Leftover ToDos: 
    // Find all characters in book (Query for for all characters in current books chapters)
    // Check which characters appear in chapter 
    // Regenerate image?!

  }

  public async regenerateChapterImage(regenerateChapterDto: RegenerateChapterDto, user: ApiKeyEntity): Promise<BooksEntity> {
    const book = await this.dataManager.getBookById(regenerateChapterDto.bookId);
    if(!book) new NotFoundException(`Book with ID ${regenerateChapterDto.bookId} not found!`)

    const chapterId = regenerateChapterDto.chapterId;
    var bookChapters : ChapterEntity[] = [book.chapters[chapterId]];

    // generate new chapter with altered image prompt 
    var newChapterArray = await this.imagePromptDesigner.generateStoryImages(book.chapters);
    // request new chapter image from image AI and save to DB
    newChapterArray = await this.requestManager.requestStoryImages(newChapterArray);
    book.chapters[chapterId] = newChapterArray[0];
    await this.dataManager.updateBookContent(book, true);

    return book;
  }

}