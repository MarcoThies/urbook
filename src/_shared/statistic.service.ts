import { Injectable } from "@nestjs/common";
import { DataManagerService } from "./data-manager.service";
import { DatabaseLoggerService } from "./database-logger.service";
import { ApiKeyDto } from "./dto/api-key.dto";
import { ApiKeyEntity } from "./entities/api-keys.entity";
import { StatisticInterface } from "./interfaces/statistic.interface";
import { UserStatisticInterface } from "./interfaces/user-statistic.interface";
import { BooksEntity } from "./entities/books.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";


@Injectable()
export class StatisticService {
  constructor(
    private readonly dataManager: DataManagerService,
    private readonly logsManager : DatabaseLoggerService,
    @InjectRepository(BooksEntity)
    private readonly booksRepo : Repository<BooksEntity>,
    @InjectRepository(ApiKeyEntity)
    private readonly apiKeyRepo : Repository<ApiKeyEntity>,
  ) {}

  public async getStatisticsOfAll(): Promise<StatisticInterface>{
    const users: string = await this.apiKeyRepo.count().toString();
    const books: string = await this.booksRepo.count().toString();
    return{
      numberOfUsers: users,
      numberOfBooks: books
    } as StatisticInterface
  }

  public async getStatisticsOfUser(user: ApiKeyEntity): Promise<UserStatisticInterface>{

    return{

    } as UserStatisticInterface;
  }
}