import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BooksEntity } from "../_shared/entities/books.entity";
import { DataManagerSubservice } from "../_shared/data-manager.subservice";
import { ApiKeyEntity } from "../_shared/entities/api-keys.entity";
import { BookIdDto } from '../_shared/dto/book-id.dto';
import { DeletedBookInterface } from './interfaces/delete-book.interface';
import { DatabaseLoggerService } from "../_shared/database-logger.service";


@Injectable()
export class ManageService {
  constructor(
    private readonly dataManager: DataManagerSubservice,
    private readonly logsManager : DatabaseLoggerService,
  ) {}

  public async listBooks(user: ApiKeyEntity): Promise<BooksEntity[]> {
    return await this.dataManager.getBookList(user);
  }

  public async deleteBook(user: ApiKeyEntity, bookIdDto: BookIdDto): Promise<DeletedBookInterface> {

    const isBookDeleted = await this.dataManager.deleteBook(user, bookIdDto);

    return {
      deletedBookId: bookIdDto.isbn,
      status: isBookDeleted,
      timeStamp: new Date().toUTCString()
    } as DeletedBookInterface;
  }
}
