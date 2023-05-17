import { InjectRepository } from "@nestjs/typeorm";
import { BooksEntity } from "../_shared/entities/books.entity";
import { Repository } from "typeorm";
import { ParameterEntity } from "../generate/entities/parameter.entity";
import { Injectable } from "@nestjs/common";
import { ApiKeyEntity } from "../_shared/entities/api-keys.entity";

@Injectable()
export class DataManagerSubservice {
  constructor(
    @InjectRepository(BooksEntity)
    private readonly booksRepo : Repository<BooksEntity>,
    @InjectRepository(ParameterEntity)
    private readonly parameterRepo : Repository<ParameterEntity>,
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
}