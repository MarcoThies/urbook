import { createConnection, ConnectionOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ApiKeyEntity } from "../_subservices/_shared/entities/api-keys.entity";
import { BooksEntity } from "../_subservices/_shared/entities/books.entity";

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

export const hash = async (value: string) : Promise<string> => {
  if(!process.env.API_SALT) throw new Error("No salt defined");
  return await bcrypt.hash(value, process.env.API_SALT);
}

export interface IStatusInfo {
  code: number;
  status: string;
  process?: string;
}
export const statusStrings = (status: number, queueLength:number=-1): IStatusInfo => {


  const textAi = "openAi - gpt3.5-turbo";
  const imgAi = "MidJourney - Niji v5";
  const queueStr = (queueLength > 0) ? queueLength + " more images" : "last image";

  let statusDict = {
    "-3": { code: -3,  status: "unknown error" },
    "-2": { code: -2,  status: "error in generation pipeline"},
    "-1": { code: -1,  status: "user aborted process" },
    "0": { code: 0,  status: "waiting to start..." },
    "1": { code: 1,  status: "story text", process: textAi},
    "2": { code: 2,  status: "character descriptions", process: textAi },
    "3": { code: 3,  status: "avatar images - " + queueStr + " in queue", process: imgAi },
    "4": { code: 4,  status: "story images - " + queueStr + " in queue", process: imgAi },
    "5": { code: 5,  status: "regenerating chapter text", process: textAi },
    "6": { code: 6,  status: "regenerating chapter image", process: imgAi },
    "9": { code: 9,  status: "generating pdf file", process: "pdf-generator" },
    "10": { code: 10, status: "done" }
  };

  return (typeof statusDict[status.toString()] === "undefined") ? statusDict["-3"] : statusDict[status.toString()];

}