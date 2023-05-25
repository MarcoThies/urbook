import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BooksEntity } from "../_shared/entities/books.entity";
import { DataManagerSubservice } from "../_subservices/data-manager.subservice";
import { ApiKeyEntity } from "../_shared/entities/api-keys.entity";
import { BookIdDto } from '../_shared/dto/book-id.dto';
import { DeletedBookInterface } from './interfaces/delete-book.interface';


@Injectable()
export class ManageService {
  constructor(
    private readonly dataManager: DataManagerSubservice,
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
