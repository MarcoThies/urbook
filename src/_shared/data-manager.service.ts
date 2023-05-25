import { InjectRepository } from "@nestjs/typeorm";
import { BooksEntity } from "./entities/books.entity";
import { getConnection, getConnectionManager, Repository } from "typeorm";
import { ParameterEntity } from "../generate/entities/parameter.entity";
import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { ApiKeyEntity } from "./entities/api-keys.entity";
import { ChapterEntity } from "../generate/entities/chapter.entity";
import { CharacterEntity } from "../generate/entities/character.entity";
import fs from "fs";
import { BookIdDto } from "./dto/book-id.dto";
import { LogEntity } from "./entities/log.entity";

@Injectable()
export class DataManagerService {
  constructor(
    @InjectRepository(BooksEntity)
    private readonly booksRepo : Repository<BooksEntity>,
    @InjectRepository(ParameterEntity)
    private readonly parameterRepo : Repository<ParameterEntity>,
    @InjectRepository(ChapterEntity)
    private readonly chapterRepo : Repository<ChapterEntity>,
    @InjectRepository(CharacterEntity)
    private readonly characterRepo : Repository<CharacterEntity>
  ) {}

  public async getBookById(bookId: string): Promise<BooksEntity> {
    return await this.booksRepo.findOne({ where: { isbn: bookId }});
  }

  public async getBookList(user: ApiKeyEntity | boolean): Promise<BooksEntity[]> {
    if(user === false) return await this.booksRepo.find();
    else return await this.booksRepo.find({ where: { apiKeyLink: user }});
  }
  public async saveNewBook(book:BooksEntity): Promise<BooksEntity> {
    // save new Parameter List
    const bookIdEntry = await this.booksRepo.create({
      ...book
    });
    // save new Book
    return await this.booksRepo.save(book);
  }

  public async updateBookContent(book: BooksEntity): Promise<BooksEntity> {

    // check if book uses images from online ressources, if yes, download them and link to local file
    const chapters = book.chapters;
    for (let ind in chapters) {
      const currImagePath = chapters[ind].imageUrl;
      if (typeof currImagePath === 'string' && currImagePath.includes('https:')){
        chapters[ind].imageUrl = await this.downloadChapterImage(book, ind);
      }
    }

    return await this.booksRepo.save(book);
  }

  public async updateChapter(newChapter: ChapterEntity): Promise<ChapterEntity> {
    return await this.chapterRepo.save(newChapter);
  }

  public async updateBookState(book: BooksEntity, state: number) {
    // TODO: Check if book generation was aborted, if yes, cancle pipeline
    book.state = state;
    await this.booksRepo.save(book);
  }

  private async downloadChapterImage(book : BooksEntity, chapterId : string): Promise<string> {

    // download image and convert it to be writabel to a file
    const response = await fetch(book.chapters[chapterId].imageUrl);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // generate path and filename
    const path = this.getBookPath(book) + '/img/';
    const fileName = chapterId + '.png'

    await this.writeFile(buffer, path, fileName)

    return path + fileName;
  }

  public getBookPath(book : BooksEntity) : string {
    const book_id = book.isbn;
    return this.getUserPath(book) + book_id + '/';
  }

  private getUserPath(book : BooksEntity) : string {
    const user_id = book.apiKeyLink.apiId;
    return './exports/' + user_id + '/';
  }


  public async fileExists(filePath : string, fileSystem: any) : Promise<Boolean> {
    try {
      await fileSystem.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  public async writeFile(content : Uint8Array, path : string, fileName : string) : Promise<boolean> {

    // generate folder structure if it doesn't exist yet
    const fs = require("fs").promises;
    const fileExists = await this.fileExists(path, fs);
    if (!fileExists){
      await fs.mkdir(path, {recursive: true});
    }
    // write file
    await fs.writeFile(path + fileName, content);

    return true;
  }

  public async readFile(filePath : string) : Promise<Uint8Array> {
    const fs = require("fs").promises;
    return await fs.readFile(filePath);
  }

  public async resetFileStructure(folder="./exports/", recreate=true) : Promise<void> {
    const fs = require("fs").promises;
    await fs.rm(folder, { recursive : true, force: true })
    if(recreate) {
      await fs.mkdir(folder);
    }
  }

  public async resetDB() : Promise<boolean> {
    await this.clearThisRepo(this.booksRepo);
    await this.clearThisRepo(this.characterRepo);
    await this.clearThisRepo(this.parameterRepo);
    return true;
  }

  private async clearThisRepo(repo : Repository<any>) : Promise<void> {
    const dataset = await repo.find();
    await repo.remove(dataset);
    return;
  }

  public async getBookIfOwned (user : ApiKeyEntity, bookId : string) : Promise<BooksEntity | boolean> {
    const result = await this.booksRepo.findOne({ where: { isbn: bookId, apiKeyLink: user }, relations: ['apiKeyLink', 'chapters', 'parameterLink'] });
    return (result) ? result : false;
  }

  public async deleteBook(user: ApiKeyEntity | boolean, bookIdDto: BookIdDto): Promise<boolean> {
    let getUserBook: BooksEntity | boolean | undefined;
    if( user === false) {
      // Admin is deleting book -> can delete any
      getUserBook = await this.booksRepo.findOne({ where: { isbn: bookIdDto.isbn }, relations: ['chapters', 'parameterLink']});
      if(!getUserBook) getUserBook = false;
    } else {
      getUserBook = await this.getBookIfOwned(user as ApiKeyEntity, bookIdDto.isbn);
    }

    if(getUserBook === false) {
      throw new HttpException(`Book with ID ${bookIdDto.isbn} not found`, HttpStatus.NOT_FOUND);
    }
    const authBook = getUserBook as BooksEntity;
    const bookId = authBook.id;
    // remove all Characters of book
    const characters = await this.characterRepo
      .createQueryBuilder('character')
      .innerJoin('character.chapter', 'chapter')  // character has 'chapter' property
      .innerJoin('chapter.book', 'book')         // chapter has 'book' property
      .where('book.id = :bookId', { bookId })
      .getMany();
    await this.characterRepo.remove(characters);

    // find book relational
    await this.parameterRepo.remove(authBook.parameterLink);
    await this.booksRepo.remove(authBook);

    await this.resetFileStructure(this.getBookPath(authBook), false);

    return true;
  }
}