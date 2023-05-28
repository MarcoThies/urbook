import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { BooksEntity } from "./entities/books.entity";
import { StatisticService } from './statistic.service';
import { ApiKeyEntity } from './entities/api-keys.entity';

@Module({
    imports: [
      TypeOrmModule.forFeature([
          BooksEntity,
          ApiKeyEntity
      ]),
    ],
    providers: [ StatisticService ],
    exports: [ StatisticService ],
})
export class StatisticModule {}