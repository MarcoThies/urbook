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
import { ChapterEntity } from "../generate/entities/chapter.entity";
import { CharacterEntity } from "../generate/entities/character.entity";


@Injectable()
export class StatisticService {
  constructor(
    @InjectRepository(BooksEntity)
    private readonly booksRepo : Repository<BooksEntity>,
    @InjectRepository(ApiKeyEntity)
    private readonly apiKeyRepo : Repository<ApiKeyEntity>,
    @InjectRepository(ChapterEntity)
    private readonly chapterRepo : Repository<ChapterEntity>,
    @InjectRepository(CharacterEntity)
    private readonly characterRepo : Repository<CharacterEntity>
  ) {}

  public async getStatisticsOfAll(): Promise<StatisticInterface>{
    const users = await this.apiKeyRepo.count();
    const books = await this.booksRepo.count();
    return{
      numberOfUsers: users.toString(),
      numberOfBooks: books.toString()
    } as StatisticInterface
  }

  public async getStatisticsOfUser(user: ApiKeyEntity): Promise<UserStatisticInterface>{
    
    const books = await this.booksRepo.find({ where: { apiKeyLink: user }});
    let imageJobs: number = 0;
    let textJobs: number = 0;
    let temp: number = 0;

    for (const element of books) {
      const temp = await this.chapterRepo.count({ where: { book: element }});
      imageJobs += temp;
      textJobs += temp * 2;
    }

    const createdBooks = await this.booksRepo.count({ where: { apiKeyLink: user }});
    const regestration = await user.createdAt;
    const lastLogin = await user.lastUse;

    return {
    numberOfImageJobs: imageJobs.toString(),
    numberOfTextJobs: textJobs.toString(),
    numberOfBooksCreated: createdBooks.toString(),
    numberOfBooksBought: "kein einziges",
    profitable: "neeeeeee, noch lange nicht",
    dateOfRegistration: regestration.toString(),
    dateOfLastLogin: lastLogin.toString()
    } as UserStatisticInterface
  }
}