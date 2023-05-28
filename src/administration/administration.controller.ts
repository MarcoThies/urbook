import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Request, UnauthorizedException,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { AdministrationService } from "./administration.service";
import { AuthGuard } from "@nestjs/passport";
import { UserTypeGuard } from "../authentification/roles/type.guard";
import { ApiKeyHashDto } from "./dto/api-key-hash.dto";
import { ApiKeyInterface } from "./interface/api-key.interface";
import { BooksEntity } from "../_shared/entities/books.entity";

@UseGuards(
  AuthGuard('jwt'),
  UserTypeGuard('admin')
)
@Controller('admin')
export class AdministrationController {
  constructor(private readonly adminService: AdministrationService ) {}

  @Get('create-key')
  async createKey(): Promise<ApiKeyInterface> {
    return await this.adminService.createKey();
  }

  @Post('remove-key')
  async removeKey(@Body() apiKeyHashDto: ApiKeyHashDto): Promise<any> {
    return await this.adminService.removeKey(apiKeyHashDto);
  }

  @Get('clear-data')
  async clearData(): Promise<any> {
    return await this.adminService.clearData();
  }
  @Get('clear-logs')
  async clearLogs(): Promise<any> {
    return await this.adminService.clearLogs();
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('list-books')
  public async listBooks(@Request() req) : Promise<BooksEntity[]> {
    return await this.adminService.listBooks();
  }

  @Post('statistic')
  async getStatistics(@Body() apiKeyHashDto: ApiKeyHashDto): Promise<any> {
    return await this.adminService.getStatistics(apiKeyHashDto);
  }

}