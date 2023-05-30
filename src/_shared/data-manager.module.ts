// Generate-Service Module
import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataManagerService } from "./data-manager.service";
import { BooksEntity } from "./entities/books.entity";
import { ParameterEntity } from "./entities/parameter.entity";
import { ChapterEntity } from "./entities/chapter.entity";
import { CharacterEntity } from "./entities/character.entity";
import { LogEntity } from "./entities/log.entity";

@Module({
    imports: [
      TypeOrmModule.forFeature([
          BooksEntity,
          ParameterEntity, ChapterEntity, CharacterEntity
      ]),
    ],
    providers: [ DataManagerService ],
    exports: [ DataManagerService ],
})
export class DataManagerModule {}
