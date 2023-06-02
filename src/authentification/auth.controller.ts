import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ILoginStatus } from "./interfaces/login-status.interface";
import { ApiKeyDto } from "../_subservices/_shared/dto/api-key.dto";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  @Post('signin')
  public async login(@Body() apiKeyDto: ApiKeyDto): Promise<ILoginStatus> {
    return await this.authService.login(apiKeyDto);
  }

}
