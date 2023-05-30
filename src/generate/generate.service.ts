// Common
import { Injectable } from '@nestjs/common';

// Interface & DTO
import { CreateBookDto } from "./dto/create-book.dto";
import { IBookId } from "./interfaces/book-id.interface";
import { ApiKeyEntity } from "../_shared/entities/api-keys.entity";

// Sub-Services
import { BookGeneratorSubservice } from "../_subservices/book-generator.subservice";
import { RegenerateChapterDto } from './dto/regenerate-chapter.dto';
import { DatabaseLoggerService } from "../_shared/database-logger.service";
import { DataManagerService } from "../_shared/data-manager.service";
import { IBookState } from "./interfaces/book-state.interface";

@Injectable()
export class GenerateService {
  constructor(
    private readonly dataManager: DataManagerService,
    private readonly bookGenSubservice : BookGeneratorSubservice,
    private readonly logsManager : DatabaseLoggerService,
  ) {}

  public async create(createBookDto: CreateBookDto, user: ApiKeyEntity): Promise<IBookId> {

    // start the generation process
    const newBook = await this.bookGenSubservice.generateNewBook(createBookDto, user);

    return {
        bookId: newBook.isbn,
        status: true,
        timeStamp: newBook.createdAt.toUTCString()
    } as IBookId;
  }

  public async checkStatus(bookId: string, user: ApiKeyEntity): Promise<IBookState> {

    const myBook = await this.dataManager.getBookWithAccessCheck(user, bookId);
    const currentQueueLength = this.bookGenSubservice.getCurrentRequestQueueLength(myBook); 

    let statusDict = {
      0: { code: 0,  status: "waiting to start...", kiHelper: "none" },
      1: { code: 1,  status: "story text", kiHelper: "txt" },
      2: { code: 2,  status: "character descriptions", kiHelper: "txt" },
      3: { code: 3,  status: "avatar images - " + currentQueueLength + " more images to be generated.", kiHelper: "img" },
      4: { code: 4,  status: "story images - " + currentQueueLength + " more images to be generated.", kiHelper: "img" },
      5: { code: 5,  status: "regenerating chapter text", kiHelper: "txt" },
      6: { code: 6,  status: "regenerating chapter image", kiHelper: "img" },
      10: { code: 10, status: "done", kiHelper: "none" },
    };

    let statusInfo;
    if(typeof statusDict[myBook.state] === "undefined") statusInfo = statusDict[10];
    else statusInfo = statusDict[myBook.state];

    return {
      bookId: myBook.isbn,
      status: statusInfo,
    } as IBookState;
  }

  public async abort(bookId: string, user: ApiKeyEntity): Promise<Boolean> {
    await this.bookGenSubservice.abort(bookId, user);
    return true;
  }

  public async regenerateChapterText(regenerateChapterDto: RegenerateChapterDto, user: ApiKeyEntity) {
 
    await this.bookGenSubservice.regenerateChapterText(regenerateChapterDto, user);

    return {
      bookId: regenerateChapterDto.bookId,
      status: true,
      timeStamp: new Date().toUTCString
    } as IBookId;
  }

  public async regenerateChapterImage(regenerateChapterDto: RegenerateChapterDto, user: ApiKeyEntity) {

    await this.bookGenSubservice.regenerateChapterImage(regenerateChapterDto, user);

    return {
      bookId: regenerateChapterDto.bookId,
      status: true,
      timeStamp: new Date().toUTCString
    } as IBookId;
  }



}
