import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { IJwtPayload } from "./interfaces/jwt-payload.interface";
import { ApiKeyDto } from "../_subservices/_shared/dto/api-key.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { ApiKeyEntity } from "../_subservices/_shared/entities/api-keys.entity";
import { Repository } from "typeorm";
import { hash } from "../_shared/utils";
import { DatabaseLoggerService } from "../_subservices/_shared/database-logger.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(ApiKeyEntity)
    private readonly apiKeyRepo : Repository<ApiKeyEntity>,
    private readonly logManager : DatabaseLoggerService,
  ) {}

  async login(apiKeyDto: ApiKeyDto): Promise<any> {
      // hash given api key
      const apiKeyHash = await hash(apiKeyDto.apiKey);

      // find api hash in db
      const keyValid = await this.apiKeyRepo.findOne({ where: { apiHash: apiKeyHash } });

      if(!keyValid){
        await this.logManager.error(`Invalid API key. - used key: ${apiKeyDto.apiKey}`, __filename, "AUTH");
        throw new HttpException('Invalid API key', HttpStatus.UNAUTHORIZED);
      }
      // update database lastUse
      keyValid.lastUse = new Date();
      await this.apiKeyRepo.save(keyValid);

      // generate and jwt token
      return this._createToken(keyValid.apiHash);
  }

  private _createToken(identityHash:string): any {
    const user: IJwtPayload = { userId:identityHash };
    const accessToken = this.jwtService.sign(user);
    return {
      timestamp: (new Date()).toUTCString(),
      accessToken
    };
  }

  async validateSession(payload: IJwtPayload): Promise<ApiKeyEntity> {
    const apiUser = await this.apiKeyRepo.findOne({ where: { apiHash: payload.userId } });
    if (!apiUser){
      await this.logManager.error('Invalid token.', __filename, "AUTH");
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    await this.logManager.log(`Login by User no.${apiUser.apiId}`, __filename, "AUTH");

    return apiUser;
  }


}
