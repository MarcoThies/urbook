// Generate-Service Module
import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataManagerSubservice } from "../_subservices/data-manager.subservice";
import { BooksEntity } from "./entities/books.entity";
import { ParameterEntity } from "../generate/entities/parameter.entity";
import { ChapterEntity } from "../generate/entities/chapter.entity";
import { CharacterEntity } from "../generate/entities/character.entity";
import { PdfGeneratorSubservice } from "../_subservices/pdf-generator.subservice";

@Module({
    imports: [
      TypeOrmModule.forFeature([
          BooksEntity,
          ParameterEntity, ChapterEntity, CharacterEntity
      ]),
    ],
    providers: [ DataManagerSubservice, PdfGeneratorSubservice ],
    exports: [ DataManagerSubservice ],
})
export class DataManagerModule {}