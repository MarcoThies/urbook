// Generate-Service Module
import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataManagerService } from "./data-manager.service";
import { BooksEntity } from "./entities/books.entity";
import { ParameterEntity } from "../generate/entities/parameter.entity";
import { ChapterEntity } from "../generate/entities/chapter.entity";
import { CharacterEntity } from "../generate/entities/character.entity";
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
