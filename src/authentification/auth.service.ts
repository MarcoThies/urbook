import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from "./interfaces/payload.interface";
import { ApiKeyDto } from "../_shared/dto/api-key.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { ApiKeyEntity } from "../_shared/entities/api-keys.entity";
import { Repository } from "typeorm";
import { HashFunctionSubservice } from "../_subservices/hash-function.subservice";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(ApiKeyEntity)
    private readonly apiKeyRepo : Repository<ApiKeyEntity>,
  ) {}

  async login(apiKeyDto: ApiKeyDto): Promise<any> {
      // hash given api key
      const hashFunctionSubservice = new HashFunctionSubservice();
      const apiKeyHash = await hashFunctionSubservice.hash(apiKeyDto.apiKey);

      // find api hash in db
      const keyValid = await this.apiKeyRepo.findOne({ where: { apiHash: apiKeyHash } });

      if(!keyValid) throw new HttpException('Invalid API key', HttpStatus.UNAUTHORIZED);

      // generate and jwt token
      return this._createToken(keyValid.apiHash);
  }

  private _createToken(identityHash:string): any {
    const user: JwtPayload = { userId:identityHash };
    const accessToken = this.jwtService.sign(user);
    return {
      timestamp: (new Date()).toLocaleDateString(),
      accessToken
    };
  }

  async validateSession(payload: JwtPayload): Promise<ApiKeyEntity> {
    const apiUser = await this.apiKeyRepo.findOne({ where: { apiHash: payload.userId } });
    if (!apiUser) throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    return apiUser;
  }


}
