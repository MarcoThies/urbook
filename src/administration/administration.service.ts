import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ApiKeyEntity } from "../_shared/entities/api-keys.entity";
import { IApiKey } from "./interface/api-key.interface";
import { generateId, hash } from "../_shared/utils";
import { DataManagerService } from "../_shared/data-manager.service";
import { BooksEntity } from "../_shared/entities/books.entity";
import { DatabaseLoggerService } from "../_shared/database-logger.service";
import { StatisticSubservice } from "../_subservices/statistic.subservice";
import { IUserStatistic } from "./interface/user-statistic.interface";
import { IStatistic } from "./interface/statistic.interface";
import { IBookInfo, IUserData } from "./interface/user-data.interface";
import { UserIdDto } from "./dto/user-id.dto";

@Injectable()
export class AdministrationService {
  constructor(
    @InjectRepository(ApiKeyEntity)
    private readonly apiKeyRepo : Repository<ApiKeyEntity>,
    private readonly dataManager : DataManagerService,
    private readonly logsManager : DatabaseLoggerService,
    private readonly statisticService : StatisticSubservice
  ) {}

  async createKey(): Promise<IApiKey> {
    // create new API key
    const newKey = generateId(4,4);

    // hash API key
    const apiKeyHash = await hash(newKey);

    // save API key hash to database (with unique check)
    // check if hash is already in Database
    const hashExists = await this.apiKeyRepo.findOne({ where: { apiHash: apiKeyHash } });
    if(hashExists) return await this.createKey(); // when key exists, restart function

    // save new API key hash to database
    const apiKeyEntry = await this.apiKeyRepo.create({
      apiHash: apiKeyHash
    });
    const newUser = await this.apiKeyRepo.save(apiKeyEntry);

    // return API key to admin
    return {
      apiKey: newKey,
      userId: newUser.apiId
    } as IApiKey;
  }

  async removeKey(userIdDto: UserIdDto): Promise<any> {
    const userExists = await this.apiKeyRepo.findOne({ where: { apiId : userIdDto.userId } });
    if(!userExists) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    await this.apiKeyRepo.delete(userExists.apiId);
    return true;
  }

  public async clearData() : Promise<boolean> {
    const clearedDb = await this.dataManager.resetDB();
    this.dataManager.resetFileStructure();
    return clearedDb;
  }

  public async clearLogs() : Promise<boolean> {
    return await this.logsManager.clearLogs();
  }

  public async listBooks(): Promise<IUserData[]> {
    // get all Books
    const allBooks = await this.dataManager.getBookList(false);
    // get all Users
    const apiUsers = await this.apiKeyRepo.find();

    // Map books to users
    let userList: IUserData[] = [];

    for(let u of apiUsers){
      // get all books of this user
      const assignedBooks = allBooks.filter((book: BooksEntity)=>{
        return book.apiKeyLink.apiId === u.apiId;
      });

      const lastUsed = (!u.lastUse) ? "no use" : u.lastUse.toUTCString();
      const registered = u.createdAt.toUTCString();

      userList.push({
        userId: u.apiId,
        admin: u.admin,
        lastUsed: lastUsed,
        created: registered,
        books: assignedBooks.map((book: BooksEntity)=>{
          return {
            title: book.title,
            isbn: book.isbn,
            created: book.createdAt.toUTCString(),
            chapterCount: book.chapters.length,
            state: book.state
          } as IBookInfo;
        })
      } as IUserData);
    }
    return userList;
  }

  async getStatistic(): Promise<IStatistic> {
    // get general statistic

    //get number of users / admins
    const userCount = await this.apiKeyRepo.count( { where: { admin: false }});
    const adminCount = await this.apiKeyRepo.count({ where: { admin: true }});
    const bookCount = await this.statisticService.getBookCount(false)

    return {
      totalUsers: userCount,
      totalAdmins: adminCount,
      totalBooks: bookCount
    } as IStatistic;
  }

  async userStatistic(userIdDto: UserIdDto): Promise<IUserStatistic>{
    // check if hash exists
    const user = await this.apiKeyRepo.findOne({ where: { apiId : userIdDto.userId } });
    if(!user) {
      throw new HttpException('API user not found', HttpStatus.NOT_FOUND);
    }
    // get Statistic of this user
    return this.statisticService.getStatisticsOfUser(user);
  }
}
