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

  log(message: string) {
    this.writeLog('info', message);
  }

  error(message: string, trace: string) {
    this.writeLog('error', message, trace);
  }

  warn(message: string) {
    this.writeLog('warning', message);
  }

  debug(message: string) {
    this.writeLog('debug', message);
  }

  verbose(message: string) {
    this.writeLog('verbose', message);
  }

  private writeLog(level: string, message: string, trace?: string) {
    const logEntry = new LogEntity();
    logEntry.level = level;
    logEntry.message = message;
    logEntry.trace = trace;
    this.logRepo.save(logEntry);
  }
}
