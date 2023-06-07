import { Injectable, LoggerService, Module } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LogEntity } from "./entities/log.entity";

@Injectable()
export class DatabaseLoggerService implements LoggerService {
  constructor(
    @InjectRepository(LogEntity)
    private readonly logRepo : Repository<LogEntity>,
  ) {}

  log(message: string, context?: string) {
    this.writeLog('info', message, undefined, context);
  }

  error(message: string, trace: string, context?: string) {
    this.writeLog('error', message, trace, context);
  }

  warn(message: string, context?: string) {
    this.writeLog('warning', message, undefined, context);
  }

  debug(message: string, context?: string) {
    this.writeLog('debug', message, undefined, context);
  }

  verbose(message: string, context?: string) {
    this.writeLog('verbose', message, undefined, context);
  }

  private writeLog(level: string, message: string, trace?: string, origin?: string) {
    const logEntry = new LogEntity();
    logEntry.level = level;
    logEntry.message = message;
    if(typeof trace !== "undefined"){
      logEntry.trace = trace;
    }
    if(typeof origin !== "undefined"){
      logEntry.context = origin;
    }
    this.logRepo.save(logEntry);
  }

  public async clearLogs() : Promise<boolean> {
    const dataset = await this.logRepo.find();
    await this.logRepo.remove(dataset);
    return true;
  }
}