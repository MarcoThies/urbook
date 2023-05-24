// Common
import { Injectable } from '@nestjs/common';

// Interface & DTO
import { CreateBookDto } from "./dto/create-book.dto";
import { BookIdInterface } from "./interfaces/book-id.interface";
import { ApiKeyEntity } from "../_shared/entities/api-keys.entity";

// Sub-Services
import { BookGeneratorSubservice } from "../_subservices/book-generator.subservice";
import { RegenerateChapterDto } from './dto/regenerate-chapter.dto';

@Injectable()
export class GenerateService {
  constructor(
    private readonly bookGenSubservice : BookGeneratorSubservice
  ) {}

  public async create(createBookDto: CreateBookDto, user: ApiKeyEntity): Promise<BookIdInterface> {

    // now start the generation process
    const newBook = await this.bookGenSubservice.generateNewBook(createBookDto, user);

    return {
        bookId: newBook.isbn,
        status: true,
        timeStamp: newBook.createdAt.toUTCString()
    } as BookIdInterface;
  } 

  public regenerateChapterText(regenerateChapterDto: RegenerateChapterDto, user: ApiKeyEntity): BookIdInterface {
 
    this.bookGenSubservice.regenerateChapterText(regenerateChapterDto, user);

    return {
      bookId: regenerateChapterDto.bookId,
      status: true,
      timeStamp: new Date().toUTCString
    } as BookIdInterface;
  }

  public regenerateChapterImage(regenerateChapterDto: RegenerateChapterDto, user: ApiKeyEntity): BookIdInterface {

    const newBook = this.bookGenSubservice.regenerateChapterImage(regenerateChapterDto, user);

    return {
      bookId: regenerateChapterDto.bookId,
      status: true,
      timeStamp: new Date().toUTCString
    } as BookIdInterface;
  }

}
