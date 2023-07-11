import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BooksEntity } from "../_subservices/_shared/entities/books.entity";
import { DataManagerService } from "../_subservices/_shared/data-manager.service";
import { ApiKeyEntity } from "../_subservices/_shared/entities/api-keys.entity";
import { BookIdDto } from '../_subservices/_shared/dto/book-id.dto';
import { IDeletedBook } from './interfaces/delete-book.interface';
import { DatabaseLoggerService } from "../_subservices/_shared/database-logger.service";
import { statusStrings } from "../_shared/utils";
import { IBookInfo } from "../administration/interface/user-data.interface";
import { promises as fs } from "fs";


@Injectable()
export class ManageService {
  constructor(
    private readonly dataManager: DataManagerService,
    private readonly logManager : DatabaseLoggerService,
  ) {}

  public async listBooks(user: ApiKeyEntity): Promise<IBookInfo[]> {
    await this.logManager.log("Receives list of his books", __filename, "MANAGE", undefined, user);
    const allUserBooks = await this.dataManager.getBookList(user, false); // not enforced, to only get own books

    const BookArray: IBookInfo[] = [];
    for(const book of allUserBooks){
      const chapterLength = book.chapters ? book.chapters.length : 0;

      let newBookEntry = {
        title: book.title,
        bookId: book.bookId,
        created: book.createdAt.toUTCString(),
        chapterCount: book.chapters.length,
        state: statusStrings(book.state),
      } as IBookInfo;

      const localImageDir = this.dataManager.getLocalImageDir(book);
      const imgFiles = await this.getLocalImages(localImageDir);

      if(chapterLength > 0 && book.chapters[chapterLength-1].imageUrl && book.chapters[chapterLength-1].imageUrl.length > 0){
        if(!imgFiles){
          newBookEntry.cover = book.chapters[chapterLength - 1].imageUrl;
        }else{
          // check if book cover is downloaded
          const localCoverName = (chapterLength-1).toString()+".png";
          newBookEntry.cover = imgFiles.includes(localCoverName) ? this.dataManager.getLivePath(localImageDir+localCoverName) : book.chapters[chapterLength - 1].imageUrl;
        }
      }
      BookArray.push(newBookEntry);
    }
    return BookArray
  }

  public async deleteBook(user: ApiKeyEntity, bookIdDto: BookIdDto): Promise<IDeletedBook> {

    const myBook = await this.dataManager.getBookWithAccessCheck(user, bookIdDto.bookId);

    if(myBook.state > 0 && myBook.state < 10) {
      await this.logManager.log(`Deleted aborted: ${myBook.bookId} - still processing`, __filename, "DELETE", myBook, user);
      throw new HttpException("Book is still being generated", HttpStatus.CONFLICT);
    }

    // check if Book has been aborted
    if(myBook.state < 0) {
      await this.logManager.log(`Deleted aborted book: ${myBook.bookId}`, __filename, "DELETE", myBook, user);
    }else{
      await this.logManager.log(`Deleted book: ${myBook.bookId}`, __filename, "DELETE", myBook, user);
    }

    const isBookDeleted = await this.dataManager.deleteBook(myBook);

    return {
      deletedBookId: bookIdDto.bookId,
      status: isBookDeleted,
      timeStamp: new Date().toUTCString()
    } as IDeletedBook;
  }

  public async getBook(user: ApiKeyEntity, bookIdDto: BookIdDto): Promise<BooksEntity> {
    const userBook = await this.dataManager.getBookWithAccessCheck(user, bookIdDto.bookId);
    await this.logManager.log(`Request single book ${bookIdDto.bookId}`, __filename, "MANAGE", userBook, user);

    const localImageDir = this.dataManager.getLocalImageDir(userBook);
    const imgFiles = await this.getLocalImages(localImageDir);

    if(!imgFiles) {
      return userBook;
    }
    // map live URLs to chapter if images are local
    userBook.chapters = userBook.chapters.map((chapter, index) => {
      // check if File already exists
      const localImageName = index.toString()+".png";

      if(imgFiles.includes(localImageName)){
        // Bild local heruntergeladen
        chapter.imageUrl = this.dataManager.getLivePath(localImageDir+localImageName);
      }
      return chapter;
    });

    return userBook;
  }

  private async getLocalImages(dir: string): Promise<string[]|false> {
    try {
      const fs = require("fs").promises;
      return await fs.readdir(dir);
    } catch (e) {
      console.log('Book directory missing', dir);
      return false;
    }
  }

}
