import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { AuthService } from "../auth.service";
import { JwtPayload } from "../interfaces/payload.interface";
import { ApiKeyEntity } from "../../_shared/entities/api-keys.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SECRETKEY,
    });
  }

  async validate(payload: JwtPayload): Promise<ApiKeyEntity> {
    const apiUser = await this.authService.validateSession(payload);
    return apiUser;
  }

}
