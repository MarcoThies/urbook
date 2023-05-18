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
  public async saveNewBook(book:BooksEntity, parameter:ParameterEntity): Promise<BooksEntity> {
    // save new Parameter List
    const parameterEntry = await this.parameterRepo.create(parameter);

    const bookIdEntry = await this.booksRepo.create({
      ...book,
      parameterLink: parameterEntry,
    });
    // save new Book
    return await this.booksRepo.save(book);
  }

  public async updateBookContent(book: BooksEntity, createPdf=false): Promise<BooksEntity> {
    // wait for PDF generator
    if(createPdf) await this.pdfGenerator.createA5Book(book);

    return await this.booksRepo.save(book);
  }

  public async saveNewChapters(chapterArr: ChapterEntity[], book:BooksEntity): Promise<BooksEntity> {
    book.chapters = chapterArr;
    return await this.booksRepo.save(book);
  }

  public async updateChapter(newChapter: ChapterEntity): Promise<ChapterEntity> {
    return await this.chapterRepo.save(newChapter);
  }

  public async createCharacter(character: CharacterEntity): Promise<CharacterEntity> {
    return await this.characterRepo.save(character);
  }

  public async updateBookState(book: BooksEntity, state: number) {
    book.state = state;
    await this.booksRepo.save(book);
  }
}