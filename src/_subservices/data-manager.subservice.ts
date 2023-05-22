import { InjectRepository } from "@nestjs/typeorm";
import { BooksEntity } from "../_shared/entities/books.entity";
import { Repository } from "typeorm";
import { ParameterEntity } from "../generate/entities/parameter.entity";
import { Injectable } from "@nestjs/common";
import { ApiKeyEntity } from "../_shared/entities/api-keys.entity";
import { ChapterEntity } from "../generate/entities/chapter.entity";
import { CharacterEntity } from "../generate/entities/character.entity";
import { PdfGeneratorSubservice } from "./pdf-generator.subservice";

@Injectable()
export class DataManagerSubservice {
  constructor(
    @InjectRepository(BooksEntity)
    private readonly booksRepo : Repository<BooksEntity>,
    @InjectRepository(ParameterEntity)
    private readonly parameterRepo : Repository<ParameterEntity>,
    @InjectRepository(ChapterEntity)
    private readonly chapterRepo : Repository<ChapterEntity>,
    @InjectRepository(CharacterEntity)
    private readonly characterRepo : Repository<CharacterEntity>,

    private readonly pdfGenerator: PdfGeneratorSubservice
  ) {}

  public async getBookById(bookId: string): Promise<BooksEntity> {
    return await this.booksRepo.findOne({ where: { isbn: bookId }});
  }

  public async getBookList(user: ApiKeyEntity): Promise<BooksEntity[]> {
    return await this.booksRepo.find({ where: { apiKeyLink: user }});
  }
  public async saveNewBook(book:BooksEntity): Promise<BooksEntity> {
    // save new Parameter List

    const bookIdEntry = await this.booksRepo.create({
      ...book
    });
    // save new Book
    return await this.booksRepo.save(book);
  }

  public async updateBookContent(book: BooksEntity, createPdf=false): Promise<BooksEntity> {

    // check if book uses images from online ressources, if yes, download them and link to local file
    const chapters = book.chapters;
    for (var ind in chapters) {
      const currImagePath = chapters[ind].imageUrl;
      console.log(currImagePath);
      if (typeof currImagePath === 'string' && currImagePath.includes('https:'))
        chapters[ind].imageUrl = await this.downloadChapterImage(book, ind);
    }

    // wait for PDF generator
    if(createPdf) await this.pdfGenerator.createA5Book(book);

    return await this.booksRepo.save(book);
  }

  public async updateChapter(newChapter: ChapterEntity): Promise<ChapterEntity> {
    return await this.chapterRepo.save(newChapter);
  }

  public async updateBookState(book: BooksEntity, state: number) {
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
    const user_id = book.apiKeyLink.apiId;
    const book_id = book.isbn;
    const path = './exports/' + user_id + '/' + book_id + '/img/';
    const fileName = chapterId + '.png'

    this.writeFile(buffer, path, fileName)

    return path + fileName;
  }

  public async writeFile(content : Uint8Array, path : string, fileName : string) : Promise<boolean> {
   
    // generate folder structure if it doesn't exist yet
    const fs = require("fs");
    if (!fs.existsSync(path)){
      fs.mkdirSync(path, { recursive: true});
    }

    // write file
    await fs.writeFile(path + fileName, content, err => {
      if (err) {
        console.error(err);
        return false;
      }
    });

    return true;
  }

  public async readFile(filePath : string) : Promise<Uint8Array> {

    const fs = require("fs");
    return await fs.promises.readFile(filePath);

  }

  public resetFileStructure() : boolean {
    const fs = require("fs");
    fs.rmSync('./exports/', { recursive : true, force: true });
    fs.mkdirSync('./exports/');
    return true;
  }

  public resetDB() : boolean {
    //this.booksRepo.clear();
    //this.chapterRepo.clear();
    //this.characterRepo.clear();
    return true;
  }

}