import { Injectable } from "@nestjs/common";
import { ApiKeyEntity } from "../_shared/entities/api-keys.entity";
import { DataManagerService } from "../_shared/data-manager.service";
import { IUserStatistic } from "../administration/interface/user-statistic.interface";

@Injectable()
export class StatisticSubservice {
  constructor(
    private readonly dataManager : DataManagerService,
  ) {}


  public async getBookCount(user: boolean | ApiKeyEntity): Promise<number> {
    const bookList = await this.dataManager.getBookList(user);
    return bookList.length;
  }

  public async getTextRequestCount(user: ApiKeyEntity): Promise<number> {
    return 0;
  }

  public async getStatisticsOfUser(user: ApiKeyEntity): Promise<IUserStatistic>{
    
    const books = await this.dataManager.getBookList(user);
    let imageJobs: number = 0;
    let textJobs: number = 0;

    // Todo also check character and all other stuff
    for (let book of books) {
      const temp = book.chapters.length;
      imageJobs += temp;
      textJobs += temp * 2;
    }

    const createdBooks = books.length;
    const registration = user.createdAt;
    const lastLogin = (!user.lastUse) ? "not used yet" : user.lastUse.toUTCString();

    return {
      numberOfImageJobs: imageJobs,
      numberOfTextJobs: textJobs,
      numberOfBooksCreated: createdBooks,
      numberOfBooksBought: 0,
      profitable: "neeeeeee, noch lange nicht",
      dateOfRegistration: registration.toUTCString(),
      dateOfLastLogin: lastLogin
    } as IUserStatistic;
  }
}