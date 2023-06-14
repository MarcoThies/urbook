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

  log(message: string, trace: string, context?: string, user?: ApiKeyEntity, book?: BooksEntity) {
    this.writeLog('info', message, trace, context, user, book);
  }

  error(message: string, trace: string, context?: string, user?: ApiKeyEntity, book?: BooksEntity) {
    this.writeLog('error', message, trace, context, user, book);
  }

  warn(message: string, trace: string, context?: string, user?: ApiKeyEntity, book?: BooksEntity) {
    this.writeLog('warning', message, trace, context, user, book);
  }

  debug(message: string, trace: string, context?: string, user?: ApiKeyEntity) {
    this.writeLog('debug', message, trace, context, user, undefined);
  }

  verbose(message: string, trace: string, context?: string) {
    this.writeLog('verbose', message, trace, context, undefined, undefined);
  }

  private writeLog(level: string, message: string, trace: string, context?: string, user?: ApiKeyEntity, book?: BooksEntity) {
    const logEntry = new LogEntity();
    logEntry.level = level;
    logEntry.message = message;
    logEntry.trace = trace;
    if(typeof context !== "undefined"){
      logEntry.context = context;
    }
    if(typeof user !== "undefined"){
      logEntry.apiKeyLink = user;
    }
    if(typeof book !== "undefined"){
      logEntry.bookLink = book;
    }
    this.logRepo.save(logEntry);
  }

  public async clearLogs() : Promise<boolean> {
    const dataset = await this.logRepo.find();
    await this.logRepo.remove(dataset);
    return true;
  }
}
