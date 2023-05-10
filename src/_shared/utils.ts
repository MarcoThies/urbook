import { createConnection, ConnectionOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ApiKeyEntity } from "./entities/api-keys.entity";
import { BooksEntity } from "./entities/books.entity";

export const toPromise = <T>(data: T): Promise<T> => {
  return new Promise<T>(resolve => {
    resolve(data);
  });
};

export const comparePasswords = async (userPassword, currentPassword) => {
  return await bcrypt.compare(currentPassword, userPassword);
};

export const createSalt = async () => {
  return await bcrypt.genSalt(10);
};
