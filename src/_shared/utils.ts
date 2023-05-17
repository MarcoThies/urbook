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


export const generateId = (segments= 3, length:number = 8, delimiter:string = "-"): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let keyGroup = [] as string[];

  let keySegment
  for (let n = 0; n < segments; n++) {
    keySegment = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      keySegment += characters.charAt(randomIndex);
    }
    keyGroup.push(keySegment);
  }
  return keyGroup.join(delimiter);
};