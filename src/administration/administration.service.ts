import { Injectable } from '@nestjs/common';
import { ApiKeyDto } from "../_shared/dto/api-key.dto";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ApiKeyEntity } from "../_shared/entities/api-keys.entity";
import { ApiKeyInterface } from "./interface/api-key.interface";
import { createSalt } from "../_shared/utils";
import { HashFunctionSubservice } from "../_subservices/hash-function.subservice";

@Injectable()
export class AdministrationService {
  constructor(
    @InjectRepository(ApiKeyEntity)
    private readonly apiKeyRepo : Repository<ApiKeyEntity>,
  ) {}

  async createKey(): Promise<ApiKeyInterface> {
    // create new API key
    const newKey = this.generateApiKey(4,4);

    // hash API key
    const hashFunctionSubservice = new HashFunctionSubservice();
    const apiKeyHash = await hashFunctionSubservice.hash(newKey);

    // save API key hash to database (with unique check)
    // check if hash is already in Database
    const hashExists = await this.apiKeyRepo.findOne({ where: { apiHash: apiKeyHash } });
    if(hashExists) return await this.createKey(); // when key exists, restart function

    // save new API key hash to database
    const apiKeyEntry = await this.apiKeyRepo.create({
      apiHash: apiKeyHash
    });
    await this.apiKeyRepo.save(apiKeyEntry);

    // return API key to admin
    return {
      apiKey: newKey
    }
  }


  generateApiKey(segments= 3, length:number = 8, delimiter:string = "-"): string {
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
  }
}
