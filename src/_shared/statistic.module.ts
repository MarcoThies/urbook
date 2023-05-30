import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { BooksEntity } from "./entities/books.entity";
import { StatisticService } from './statistic.service';
import { ApiKeyEntity } from './entities/api-keys.entity';
import { ChapterEntity } from "./entities/chapter.entity";
import { CharacterEntity } from "./entities/character.entity";

@Module({
    imports: [
      TypeOrmModule.forFeature([
          BooksEntity,
          ApiKeyEntity,
          ChapterEntity,
          CharacterEntity
      ]),
    ],
    providers: [ StatisticService ],
    exports: [ StatisticService ],
})
export class StatisticModule {}