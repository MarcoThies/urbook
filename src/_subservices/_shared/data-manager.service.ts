import { InjectRepository } from "@nestjs/typeorm";
import { BooksEntity } from "./entities/books.entity";
import { getConnection, getConnectionManager, Repository } from "typeorm";
import { ParameterEntity } from "./entities/parameter.entity";
import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { ApiKeyEntity } from "./entities/api-keys.entity";
import { ChapterEntity } from "./entities/chapter.entity";
import { CharacterEntity } from "./entities/character.entity";
import fs from "fs";
import { BookIdDto } from "./dto/book-id.dto";
import { LogEntity } from "./entities/log.entity";
import { urlencoded } from "express";
import { DatabaseLoggerService } from "./database-logger.service";

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
    private readonly characterRepo : Repository<CharacterEntity>,

    private readonly logManager : DatabaseLoggerService
  ) {}

  public async getBookById(bookId: string): Promise<BooksEntity | null> {
    const myBook = await this.booksRepo.findOne({ where: { isbn: bookId }, relations : ['apiKeyLink', 'parameterLink'] });
    return myBook;
  }

  public async getBookList(user: ApiKeyEntity | boolean): Promise<BooksEntity[]> {
    if(user === false) {
      this.logManager.log("Admin receives list of all books", __filename, "GET BOOK LIST");
      return await this.booksRepo.find({
        relations: ['apiKeyLink']
      });
    } else {
      this.logManager.log("User receives list of his books", __filename, "GET BOOK LIST", user as ApiKeyEntity);
      return await this.booksRepo.find({
        where: { apiKeyLink: user }
      });
    }
  }
  public async saveNewBook(book:BooksEntity): Promise<BooksEntity> {
    // save new Parameter List
    const bookIdEntry = await this.booksRepo.create({
      ...book
    });
    // save new Book
    const savedBook = await this.booksRepo.save(bookIdEntry);
    this.logManager.log(`New Book saved!`, __filename, "NEW BOOK", savedBook.apiKeyLink, savedBook);
    return savedBook;
  }

  public async getBookPdf(user: ApiKeyEntity, bookId: string): Promise<any> {
    const myBook = await this.getBookWithAccessCheck(user, bookId);
    // check if status is ready
    if(myBook.state < 9){
      this.logManager.warn('Book is still generating. Abort...', __filename, "GET PDF", user, myBook);
      throw new HttpException('Book is still generating. Abort...', HttpStatus.CONFLICT);
    }

    // check if pdf exists
    const pdfPath = this.getBookPath(myBook) + myBook.title + '-v2.pdf';
    const fs = require("fs").promises;
    const fileExists = await this.fileExists("."+pdfPath, fs);

    if(!fileExists){
      this.logManager.warn(`No book PDF-found at ${pdfPath}`, __filename, "GET PDF", user, myBook);
      throw new HttpException(`No book PDF-found at ${pdfPath}`, HttpStatus.CONFLICT);
    }

    this.logManager.log(`User gets PDF`, __filename, "GET PDF", user, myBook);
    return {
      pdfUrl: 'http://localhost:3000' + encodeURI(pdfPath)
    };
  }

  public async updateBookContent(book: BooksEntity): Promise<BooksEntity> {

    // check if book uses images from online ressources, if yes, download them and link to local file
    const chapters = book.chapters;
    for (let ind in chapters) {
      const currImagePath: string | undefined = chapters[ind].imageUrl;
      if (currImagePath && currImagePath.includes('https:')){
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
    const path = "."+this.getBookPath(book) + 'img/';
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
    return '/exports/' + user_id + '/';
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

  private async getBookIfOwned (user : ApiKeyEntity, bookId : string) : Promise<BooksEntity | boolean> {
    const result = await this.booksRepo.findOne({ where: { isbn: bookId, apiKeyLink: user }, relations: ['apiKeyLink', 'chapters', 'parameterLink'] });
    return (result) ? result : false;
  }

  public async getBookWithAccessCheck(user: ApiKeyEntity, bookIsbn: string): Promise<BooksEntity> {
    if(user.admin === true) {
      // Admin can access any book
      const anyBook = await this.getBookById(bookIsbn);
      if(!anyBook){
        await this.logManager.error(`Can't find book with id ${bookIsbn}`, __filename, " ADMIN GET BOOK", user);
        throw new HttpException(`Can't find book with id ${bookIsbn}`, HttpStatus.CONFLICT);
      }
      return anyBook;

    }else{
      // check if user is allowed to access this book
      const myBook = await this.getBookIfOwned(user, bookIsbn);
      if(myBook === false){
        await this.logManager.error(`Can't find book with id ${bookIsbn} or not from this user`, __filename, "GET BOOK", user);
        throw new HttpException(`Can't find book with id ${bookIsbn}`, HttpStatus.CONFLICT);
      }
      return myBook as BooksEntity;
    }
  }

  public async deleteBook(book: BooksEntity): Promise<boolean> {

    this.logManager.log("Book deleted", __filename, "DELETE BOOK", book.apiKeyLink, book);
    const bookId = book.id;
    // remove all Characters of book
    const characters = await this.characterRepo
      .createQueryBuilder('character')
      .innerJoin('character.chapter', 'chapter')  // character has 'chapter' property
      .innerJoin('chapter.book', 'book')         // chapter has 'book' property
      .where('book.id = :bookId', { bookId })
      .getMany();
    await this.characterRepo.remove(characters);

    // find book relational
    await this.parameterRepo.remove(book.parameterLink);

    await this.booksRepo.remove(book);
    await this.resetFileStructure("."+this.getBookPath(book), false);

    return true;
  }
}