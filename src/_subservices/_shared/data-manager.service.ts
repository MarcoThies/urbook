import { InjectRepository } from "@nestjs/typeorm";
import { BooksEntity } from "./entities/books.entity";
import { Between, FindManyOptions, getConnection, getConnectionManager, LessThan, MoreThan, Repository } from "typeorm";
import { ParameterEntity } from "./entities/parameter.entity";
import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { ApiKeyEntity } from "./entities/api-keys.entity";
import { ChapterEntity } from "./entities/chapter.entity";
import { CharacterEntity } from "./entities/character.entity";
import { LogEntity } from "./entities/log.entity";
import { DatabaseLoggerService } from "./database-logger.service";
import * as path from 'path';
import { extname } from 'path';
import * as process from "process";

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
    @InjectRepository(LogEntity)
    private readonly logRepo : Repository<LogEntity>,

    private readonly logManager : DatabaseLoggerService
  ) {}

  public async getBookById(bookId: string): Promise<BooksEntity | null> {
    return await this.booksRepo.findOne({ where: { bookId: bookId }, relations : ['apiKeyLink', 'parameterLink'] });
  }

  public async getBookList(user: ApiKeyEntity, enforced=true): Promise<BooksEntity[]> {
    if(user.admin && enforced) {
      await this.logManager.log("Admin receives list of all books", __filename, "DATABASE", undefined, user);
      return await this.booksRepo.find({
        relations: ['apiKeyLink']
      });
    } else {
      await this.logManager.log("User receives list of his books", __filename, "DATABASE", undefined, user);
      return await this.booksRepo.find({
        where: { apiKeyLink: user }
      });
    }
  }

  public async userIsGenerating(user: ApiKeyEntity): Promise<boolean> {
    const generatingBooks = await this.booksRepo.find({
      where: { apiKeyLink: user, state: Between(1,9) }
    });
    return generatingBooks.length > 0;
  }

  public async saveNewBook(book:BooksEntity): Promise<BooksEntity> {
    // save new Parameter List
    const bookIdEntry = await this.booksRepo.create({
      ...book
    });
    // save new Book
    const savedBook = await this.booksRepo.save(bookIdEntry);
    await this.logManager.log(`New Book saved`, __filename, "DATABASE", savedBook);
    return savedBook;
  }

  public async getBookPdf(user: ApiKeyEntity, bookId: string): Promise<any> {
    const myBook = await this.getBookWithAccessCheck(user, bookId);
    // check if status is ready
    if(myBook.state < 9){
      await this.logManager.error('Book is still generating. Abort...', __filename, "GET PDF", myBook, user);
      throw new HttpException('Book is still generating. Abort...', HttpStatus.CONFLICT);
    }

    // check if pdf exists
    const pdfPath = this.getBookPath(myBook) + myBook.title + '.pdf';
    const fs = require("fs").promises;
    const fileExists = await this.fileExists("."+pdfPath, fs);

    if(!fileExists) {
      await this.logManager.error(`No book PDF-found at ${pdfPath}`, __filename, "GET PDF", myBook, user);
      throw new HttpException(`No book PDF-found at ${pdfPath}`, HttpStatus.CONFLICT);
    }

    await this.logManager.log(`PDF-File accessed`, __filename, "GET PDF", myBook, user);
    return {
      pdfUrl: encodeURI(this.getLivePath(pdfPath))
    };
  }

  public async updateBookContent(book: BooksEntity): Promise<BooksEntity> {
    console.log("Try to update book content");

    await this.loadAllImages(book);

    await this.logManager.log("Book content updated", __filename, "DATABASE", book);

    return await this.booksRepo.save(book);
  }

  public async updateChapter(newChapter: ChapterEntity): Promise<ChapterEntity> {
    return await this.chapterRepo.save(newChapter);
  }

  public async updateBookState(book: BooksEntity, state: number) {
    console.log("Try to update book state");
    book.state = state;
    await this.logManager.log(`New Book state: ${state}`, __filename, "DATABASE", book);
    await this.booksRepo.save(book);
  }

  public async loadAllImages(book: BooksEntity){
    const chapters = book.chapters;
    for (let ind in chapters) {
      const currImagePath: string | undefined = chapters[ind].imageUrl;
      if (currImagePath && currImagePath.includes('https:')){
        chapters[ind].imageUrl = await this.downloadChapterImage(book, ind);
      }
    }
  }
  private async downloadChapterImage(book : BooksEntity, chapterId : string): Promise<string> {
    let urlObj = new URL(book.chapters[chapterId].imageUrl);
    const originalFileEnding = extname(urlObj.pathname);
    // download image and convert it to be writabel to a file
    const response = await fetch(urlObj.href);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // generate path and filename
    const path = "."+this.getBookPath(book) + 'img/';
    const fileName = chapterId + originalFileEnding;

    await this.writeFile(buffer, path, fileName);
    await this.logManager.log(`New image saved to system: ${path+fileName}`, __filename, "DATABASE", book);

    return path + fileName;
  }

  public getBookPath(book : BooksEntity) : string {
    const book_id = book.bookId;
    return this.getUserPath(book) + book_id + '/';
  }

  private getUserPath(book : BooksEntity) : string {
    const user_id = book.apiKeyLink.apiId;
    return '/exports/' + user_id + '/';
  }

  public getLivePath(filePath: string): string{
    if(!process.env.LIVE_URL || !process.env.FILE_SSL || !process.env.FILE_PORT) return filePath;

    const stripedDomain = (process.env.LIVE_URL as string).endsWith('/') ? (process.env.LIVE_URL as string).slice(0, -1) : (process.env.LIVE_URL as string);
    const liveDomain = stripedDomain + ":" + process.env.FILE_PORT as string;
    let imageFile;

    if (filePath.includes('./exports')) {
      const newUrl = filePath.replace('./exports', '');
      const joinedUrl = path.join(liveDomain, newUrl);
      const sslPrefix = ((process.env.FILE_SSL).toLowerCase() === "false") ? 'http' : 'https';
      imageFile = sslPrefix + "://" + joinedUrl;
    }else{
      imageFile = filePath;
    }

    console.log(imageFile);

    return imageFile;
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
    const result = await this.booksRepo.findOne({ where: { bookId: bookId, apiKeyLink: user }, relations: ['apiKeyLink', 'chapters', 'parameterLink'] });
    return (result) ? result : false;
  }

  public async getBookWithAccessCheck(user: ApiKeyEntity, bookId: string): Promise<BooksEntity> {
    if(user.admin === true) {
      // Admin can access any book
      const anyBook = await this.getBookById(bookId);
      if(!anyBook){
        await this.logManager.error(`Can't find book with id ${bookId}`, __filename, " ADMIN GET BOOK", undefined, user);
        throw new HttpException(`Can't find book with id ${bookId}`, HttpStatus.CONFLICT);
      }
      return anyBook;

    }else{
      // check if user is allowed to access this book
      const myBook = await this.getBookIfOwned(user, bookId);
      if(myBook === false){
        await this.logManager.error(`Can't find book with id ${bookId} or not from this user`, __filename, "GET BOOK", undefined, user);
        throw new HttpException(`Can't find book with id ${bookId}`, HttpStatus.CONFLICT);
      }
      return myBook as BooksEntity;
    }
  }

  public async deleteBook(book: BooksEntity): Promise<boolean> {

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
    await this.logManager.error(`Removed book ${book.bookId} from system`, __filename, "DATABASE", book);

    await this.parameterRepo.remove(book.parameterLink);

    await this.booksRepo.remove(book);
    await this.resetFileStructure("."+this.getBookPath(book), false);

    return true;
  }

  public async getLogs(user: ApiKeyEntity|boolean, time: number|boolean, book: BooksEntity|boolean ): Promise<LogEntity[]>{

    let ormOptions: FindManyOptions<LogEntity> = {
      relations: ["apiKeyLink", "bookLink"],
      order: {id: "DESC"},
    };

    if(user !== false){
      ormOptions.where = {};
      (ormOptions.where as any).apiKeyLink = user;
    }

    if(book !== false){
      if(!ormOptions.where) ormOptions.where = {};
      (ormOptions.where as any).bookLink = book;
    }

    if(time === false){
      ormOptions.take = 100;
    }else if(typeof(time) === "number"){
      const timeNow = Math.floor(Date.now() / 1000);
      const timePast = timeNow - time;

      if(!ormOptions.where) ormOptions.where = {};
      (ormOptions.where as any).time = MoreThan(new Date(timePast * 1000));
    }

    return await this.logRepo.find(ormOptions);
  }
}