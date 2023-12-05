// Generate-Service Module
import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataManagerService } from "./data-manager.service";
import { BooksEntity } from "./entities/books.entity";
import { ParameterEntity } from "./entities/parameter.entity";
import { ChapterEntity } from "./entities/chapter.entity";
import { CharacterEntity } from "./entities/character.entity";
import { DatabaseLoggerModule } from "./database-logger.module";
import { LogEntity } from './entities/log.entity';
import { StatisticsEntity } from "./entities/statistics.entitiy";

@Module({
    imports: [
      TypeOrmModule.forFeature([
          BooksEntity,
          ParameterEntity, ChapterEntity, CharacterEntity, LogEntity, StatisticsEntity
      ]),
      DatabaseLoggerModule
    ],
    providers: [ DataManagerService ],
    exports: [ DataManagerService ],
})
export class DataManagerModule {}
