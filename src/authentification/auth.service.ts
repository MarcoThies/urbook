import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from "../user/dto/user.create.dto";
import { UserService } from "../user/user.service";
import { RegistrationStatus } from "./interfaces/registration-status.interface";
import { LoginUserDto } from "../user/dto/user-login.dto";
import { UserDto } from '../user/dto/user.dto';
import { LoginStatus } from './interfaces/login-status.interface';
import { JwtPayload } from "./interfaces/payload.interface";
import { stat } from "fs";
import { retry } from "rxjs";
import { ApiKeyDto } from "../_shared/dto/api-key.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { ApiKeyEntity } from "../_shared/entities/api-keys.entity";
import { Repository } from "typeorm";
import { hashKey } from "../_shared/utils";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(ApiKeyEntity)
    private readonly apiKeyRepo : Repository<ApiKeyEntity>,
  ) {}

  async login(apiKeyDto: ApiKeyDto): Promise<any> {
      // hash given api key
      const apiKeyHash = await hashKey(apiKeyDto.apiKey);

      // find api hash in db
      const keyValid = await this.apiKeyRepo.findOne({ where: { apiHash: apiKeyHash } });

      if(!keyValid) return new HttpException('Invalid API key', HttpStatus.UNAUTHORIZED);

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

  /*
  async validateUser(payload: JwtPayload): Promise<UserDto> {
    const user = await this.userService.findByPayload(payload);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
  */

}
