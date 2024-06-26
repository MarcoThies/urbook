import { Injectable, LoggerService, Module } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LogEntity } from "./entities/log.entity";
import { ApiKeyEntity } from "./entities/api-keys.entity";
import { BooksEntity } from "./entities/books.entity";

@Injectable()
export class DatabaseLoggerService implements LoggerService {
  constructor(
    @InjectRepository(LogEntity)
    private readonly logRepo : Repository<LogEntity>,
  ) {}


  async log(message: string, trace: string, context: string, book?: BooksEntity, user?: ApiKeyEntity) {
    await this.writeLog('info', message, trace, context, user, book);
  }

  async error(message: string, trace: string, context: string, book?: BooksEntity, user?: ApiKeyEntity) {
    await this.writeLog('error', message, trace, context, user, book);
  }

  async warn(message: string, trace: string, context: string, book?: BooksEntity, user?: ApiKeyEntity) {
    await this.writeLog('warning', message, trace, context, user, book);
  }

  async debug(message: string, trace: string, context: string, user?: ApiKeyEntity) {
    await this.writeLog('debug', message, trace, context, user, undefined);
  }

  async verbose(message: string, trace: string, context: string) {
    await this.writeLog('verbose', message, trace, context, undefined, undefined);
  }

  private async writeLog(level: string, message: string, trace: string, context: string, user?: ApiKeyEntity, book?: BooksEntity) {
    const logEntry = new LogEntity();
    logEntry.level = level;
    logEntry.message = message;
    logEntry.trace = trace;
    logEntry.context = context;

    if(typeof book !== "undefined"){
      logEntry.bookLink = book;
      logEntry.apiKeyLink = book.apiKeyLink;
    }

    if(typeof user !== "undefined"){
      logEntry.apiKeyLink = user;
    }

    console.log('INFO', message);

    try {
      await this.logRepo.save(logEntry);
    } catch(e) {
      console.log('DB-WARNING', e);
    }
  }

  public async clearLogs() : Promise<boolean> {
    try {
      const dataset = await this.logRepo.find();
      await this.logRepo.remove(dataset);
    } catch(e) {
      console.log('DB-WARNING', e);
    }
    return true;
  }
}
