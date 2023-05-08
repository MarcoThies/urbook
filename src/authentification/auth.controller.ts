import { Body, Controller, Get, HttpException, HttpStatus, Post, Request } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegistrationStatus } from "./interfaces/registration-status.interface";
import { LoginUserDto } from "../user/dto/user-login.dto";
import { LoginStatus } from "./interfaces/login-status.interface";
import { CreateUserDto } from "../user/dto/user.create.dto";
import { UserDto } from "../user/dto/user.dto";
import { JwtPayload } from "./interfaces/payload.interface";
import { UserEntity } from "../user/entities/user.entity";
import { ApiKeyDto } from "../_shared/dto/api-key.dto";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  // @Post('register')
  // public async register(@Body() createUserDto: CreateUserDto): Promise<RegistrationStatus> {
  //   const result:
  //     RegistrationStatus = await this.authService.register(createUserDto);
  //   return result;
  // }

  @Post('signin')
  public async login(@Body() apiKeyDto: ApiKeyDto): Promise<LoginStatus> {
    return await this.authService.login(apiKeyDto);
  }

}
