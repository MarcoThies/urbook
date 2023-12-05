import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ApiKeyEntity } from "../_subservices/_shared/entities/api-keys.entity";
import { BooksEntity } from "../_subservices/_shared/entities/books.entity";
import { ParameterEntity } from "../_subservices/_shared/entities/parameter.entity";
import { ChapterEntity } from "../_subservices/_shared/entities/chapter.entity";
import { CharacterEntity } from "../_subservices/_shared/entities/character.entity";
import { LogEntity } from "../_subservices/_shared/entities/log.entity";
import { StatisticsEntity } from "../_subservices/_shared/entities/statistics.entitiy";

const config: TypeOrmModuleOptions = {
  type: "mariadb",
  host: process.env.TYPEORM_HOST,
  port: Number(process.env.TYPEORM_PORT),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  synchronize: process.env.TYPEORM_SYNC === 'true',
  logging: ["error"],
  entities: [ApiKeyEntity, LogEntity, StatisticsEntity, BooksEntity, ParameterEntity, ChapterEntity, CharacterEntity]
};
export = config;