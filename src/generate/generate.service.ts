// Common
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { IQueueInfo, statusStrings } from "../_shared/utils";

// Interface & DTO
import { CreateBookDto } from "./dto/create-book.dto";
import { IBookId } from "./interfaces/book-id.interface";
import { ApiKeyEntity } from "../_subservices/_shared/entities/api-keys.entity";
import { IBookState } from "./interfaces/book-state.interface";

// Sub-Services
import { BookGeneratorSubservice } from "../_subservices/book-generator.subservice";
import { RegenerateChapterDto } from './dto/regenerate-chapter.dto';
import { DatabaseLoggerService } from "../_subservices/_shared/database-logger.service";
import { DataManagerService } from "../_subservices/_shared/data-manager.service";
import { RequestManagerSubservice } from '../_subservices/request-manager.subservice';
import { PdfGeneratorSubservice } from "../_subservices/pdf-generator.subservice";

@Injectable()
export class GenerateService {
  constructor(
    private readonly dataManager: DataManagerService,
    private readonly bookGenSubservice : BookGeneratorSubservice,
    private readonly pdfGenSubservice : PdfGeneratorSubservice,
    private readonly logManager : DatabaseLoggerService,
    private readonly requestManager : RequestManagerSubservice
  ) {}

  public async create(createBookDto: CreateBookDto, user: ApiKeyEntity): Promise<IBookId> {

    if(await this.dataManager.userIsGenerating(user)) {
      throw new HttpException("User is already generating a book currently", HttpStatus.CONFLICT);
    }
    // start the generation process
    const newBook = await this.bookGenSubservice.generateNewBook(createBookDto, user);

    return {
        bookId: newBook.bookId,
        status: true,
        timeStamp: newBook.createdAt.toUTCString()
    } as IBookId;
  }

  public async checkStatus(bookId: string, user: ApiKeyEntity): Promise<IBookState> {

    const myBook = await this.dataManager.getBookWithAccessCheck(user, bookId);

    const currentQueueLength = this.requestManager.getCurrentRequestQueueLength(myBook.state);

    const queueLength = myBook.chapters.length;
    const queueInfo = (currentQueueLength !== false) ? {
      left: currentQueueLength,
      target: queueLength,
      percent: Math.round(((queueLength-currentQueueLength) / queueLength) * 100) / 100
    } as IQueueInfo : undefined;

    const statusInfo = statusStrings(myBook.state, queueInfo);

    return {
      bookId: myBook.bookId,
      status: statusInfo,
    } as IBookState;
  }

  public async abort(bookId: string, user: ApiKeyEntity): Promise<Boolean> {
    await this.bookGenSubservice.abort(bookId, user);
    return true;
  }

  public async regenerateChapterText(regenerateChapterDto: RegenerateChapterDto, user: ApiKeyEntity) {
    if(await this.dataManager.userIsGenerating(user)) {
      throw new HttpException("User is already generating a book currently", HttpStatus.CONFLICT);
    }

    await this.bookGenSubservice.regenerateChapterText(regenerateChapterDto, user);

    return {
      bookId: regenerateChapterDto.bookId,
      status: true,
      timeStamp: new Date().toUTCString
    } as IBookId;
  }

  public async regenerateChapterImage(regenerateChapterDto: RegenerateChapterDto, user: ApiKeyEntity) {
    if(await this.dataManager.userIsGenerating(user)) {
      throw new HttpException("User is already generating a book currently", HttpStatus.CONFLICT);
    }

    await this.bookGenSubservice.regenerateChapterImage(regenerateChapterDto, user);

    return {
      bookId: regenerateChapterDto.bookId,
      status: true,
      timeStamp: new Date().toUTCString
    } as IBookId;
  }


  async regeneratePDF(bookId: string, user: ApiKeyEntity) {
    if(await this.dataManager.userIsGenerating(user)) {
      throw new HttpException("User is already generating a book currently", HttpStatus.CONFLICT);
    }

    const userBook = await this.dataManager.getBookWithAccessCheck(user, bookId);

    const pdfSaved = await this.pdfGenSubservice.createA5Book(userBook);

    return {
      bookId: userBook.bookId,
      status: pdfSaved,
      timeStamp: new Date().toUTCString
    } as IBookId;
  }
}
