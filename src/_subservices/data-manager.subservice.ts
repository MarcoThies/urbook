import { InjectRepository } from "@nestjs/typeorm";
import { BooksEntity } from "../_shared/entities/books.entity";
import { Repository } from "typeorm";
import { ParameterEntity } from "../generate/entities/parameter.entity";
import { Injectable, HttpException } from "@nestjs/common";
import { ApiKeyEntity } from "../_shared/entities/api-keys.entity";
import { ChapterEntity } from "../generate/entities/chapter.entity";
import { CharacterEntity } from "../generate/entities/character.entity";
import { PdfGeneratorSubservice } from "./pdf-generator.subservice";
import { BookIdDto } from "../_shared/dto/book-id.dto";

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

  public async deleteBook(user: ApiKeyEntity, bookIdDto: BookIdDto): Promise<boolean> {
    if( /*user = admin */false) {
      const isbnExists = await this.booksRepo.findOne({ where: { isbn: bookIdDto.isbn }});
      if(!isbnExists) throw new HttpException('Book ID not found', 404);
      await this.parameterRepo.delete(isbnExists.parameterLink);
      //await this.chapterRepo.delete(isbnExists.chapters);
      await this.booksRepo.delete(isbnExists);
    } 
    else {
      const isbnExists = await this.booksRepo.findOne({ where: { isbn: bookIdDto.isbn } && { apiKeyLink: user}});
      if(!isbnExists) throw new HttpException('Book ID not found or not your Book ID', 404);
      await this.parameterRepo.delete(isbnExists.parameterLink);
      //await this.chapterRepo.delete(isbnExists.chapters);
      await this.booksRepo.delete(isbnExists);
    }
    return true;
  }
}