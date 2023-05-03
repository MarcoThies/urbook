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

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(userDto: CreateUserDto): Promise<RegistrationStatus> {
    let status: RegistrationStatus = {
      success: true,
      message: 'user registered',
    };

    try {
      await this.userService.create(userDto);
    } catch (err) {
      status.success = false;
      status.message = err.response;
      status.code = err.status;
    }

    return status;
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginStatus> {
    // find user in db
    try {
      const user = await this.userService.findByLogin(loginUserDto);

      // generate and sign token
      const token = this._createToken(user);

      return {
        username: user.username,
        ...token
      };

    } catch (err) {
      console.log(err);
      return {
        code: err.status,
        message: err.response
      } as any
    }
  }

  private _createToken({ username }: UserDto): any {
    const user: JwtPayload = { username };
    const accessToken = this.jwtService.sign(user);
    return {
      timestamp: (new Date()).toLocaleDateString(),
      accessToken,
    };
  }

  async validateUser(payload: JwtPayload): Promise<UserDto> {
    const user = await this.userService.findByPayload(payload);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }


}
