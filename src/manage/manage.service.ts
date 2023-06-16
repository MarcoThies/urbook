import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BooksEntity } from "../_subservices/_shared/entities/books.entity";
import { DataManagerService } from "../_subservices/_shared/data-manager.service";
import { ApiKeyEntity } from "../_subservices/_shared/entities/api-keys.entity";
import { BookIdDto } from '../_subservices/_shared/dto/book-id.dto';
import { IDeletedBook } from './interfaces/delete-book.interface';
import { DatabaseLoggerService } from "../_subservices/_shared/database-logger.service";


@Injectable()
export class ManageService {
  constructor(
    private readonly dataManager: DataManagerService,
    private readonly logManager : DatabaseLoggerService,
  ) {}

  public async listBooks(user: ApiKeyEntity): Promise<BooksEntity[]> {
    await this.logManager.log("Receives list of his books", __filename, "MANAGE", undefined, user);
    return await this.dataManager.getBookList(user);
  }

  public async deleteBook(user: ApiKeyEntity, bookIdDto: BookIdDto): Promise<IDeletedBook> {

    const myBook = await this.dataManager.getBookWithAccessCheck(user, bookIdDto.isbn);

    if(myBook.state > 0 && myBook.state < 10) {
      await this.logManager.log(`Deleted aborted: ${myBook.isbn} - still processing`, __filename, "DELETE", myBook, user);
      throw new HttpException("Book is still being generated", HttpStatus.CONFLICT);
    }

    // check if Book has been aborted
    if(myBook.state < 0) {
      await this.logManager.log(`Deleted aborted book: ${myBook.isbn}`, __filename, "DELETE", myBook, user);
    }else{
      await this.logManager.log(`Deleted book: ${myBook.isbn}`, __filename, "DELETE", myBook, user);
    }

    const isBookDeleted = await this.dataManager.deleteBook(myBook);

    return {
      deletedBookId: bookIdDto.isbn,
      status: isBookDeleted,
      timeStamp: new Date().toUTCString()
    } as IDeletedBook;
  }

  public async getBook(user: ApiKeyEntity, bookIdDto: BookIdDto): Promise<BooksEntity> {
    const userBook = await this.dataManager.getBookWithAccessCheck(user, bookIdDto.isbn);
    await this.logManager.log(`Request single book ${bookIdDto.isbn}`, __filename, "MANAGE", userBook, user);
    return userBook;
  }

  public async getPdf(user: ApiKeyEntity, bookIdDto: BookIdDto): Promise<any> {
    return await this.dataManager.getBookPdf(user, bookIdDto.isbn);
  }
}
