import { HttpException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ApiKeyEntity } from "../_shared/entities/api-keys.entity";
import { ApiKeyInterface } from "./interface/api-key.interface";
import { ApiKeyHashDto } from "./dto/api-key-hash.dto";
import { generateId, hash } from "../_shared/utils";

@Injectable()
export class AdministrationService {
  constructor(
    @InjectRepository(ApiKeyEntity)
    private readonly apiKeyRepo : Repository<ApiKeyEntity>,
  ) {}

  async createKey(): Promise<ApiKeyInterface> {
    // create new API key
    const newKey = generateId(4,4);

    // hash API key
    const apiKeyHash = await hash(newKey);

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

  async removeKey(apiKeyHashDto: ApiKeyHashDto): Promise<any> {
    const hashExists = await this.apiKeyRepo.findOne({ where: { ...apiKeyHashDto } });
    if(!hashExists) throw new HttpException('API key not found', 404);
    await this.apiKeyRepo.delete(hashExists.apiId);
    return true;
  }

}
