import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ApiKeyEntity } from "../_shared/entities/api-keys.entity";
import { BooksEntity } from "../_shared/entities/books.entity";
import { ParameterEntity } from "../generate/entities/parameter.entity";

const config: TypeOrmModuleOptions = {
  type: "mariadb",
  host: process.env.TYPEORM_HOST,
  port: Number(process.env.TYPEORM_PORT),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  synchronize: process.env.TYPEORM_SYNC === 'true',
  logging: true,
  entities: [ApiKeyEntity, BooksEntity, ParameterEntity]
};
export = config;