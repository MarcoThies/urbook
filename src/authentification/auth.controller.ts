import { Body, Controller, Get, HttpException, HttpStatus, Post, Request } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegistrationStatus } from "./interfaces/registration-status.interface";
import { LoginStatus } from "./interfaces/login-status.interface";
import { JwtPayload } from "./interfaces/payload.interface";
import { ApiKeyDto } from "../_shared/dto/api-key.dto";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  @Post('signin')
  public async login(@Body() apiKeyDto: ApiKeyDto): Promise<LoginStatus> {
    return await this.authService.login(apiKeyDto);
  }

}
