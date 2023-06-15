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
import { IApiKey } from "./interface/api-key.interface";
import { IStatistic } from "./interface/statistic.interface";
import { IUserStatistic } from "./interface/user-statistic.interface";
import { IUserData } from "./interface/user-data.interface";
import { UserIdDto } from "./dto/user-id.dto";
import { IUserLogs } from "./interface/user-logs.interface";
import { LogsDto } from "./dto/logs.dto";

@UseGuards(
  AuthGuard('jwt'),
  UserTypeGuard('admin')
)
@Controller('admin')
export class AdministrationController {
  constructor(private readonly adminService: AdministrationService ) {}

  @Get('create-key')
  async createKey(): Promise<IApiKey> {
    return await this.adminService.createKey();
  }

  @Post('remove-key')
  async removeKey(@Body() userIdDto: UserIdDto): Promise<any> {
    return await this.adminService.removeKey(userIdDto);
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
  public async listBooks(@Request() req) : Promise<IUserData[]> {
    return await this.adminService.listBooks();
  }

  @Get('statistic')
  async statistics(): Promise<IStatistic> {
    return await this.adminService.getStatistic();
  }

  @Post('user-statistic')
  async userStatistics(@Body() userIdDto: UserIdDto): Promise<IUserStatistic> {
    return await this.adminService.userStatistic(userIdDto);
  }

  @Post('get-logs')
  async getLogs(@Body() userLogsDto: LogsDto): Promise<IUserLogs[]> {
    return await this.adminService.getLogs(userLogsDto);
  }
}