import { Controller, Get } from "@nestjs/common";
import { AdministrationService } from "./administration.service";

@Controller('admin')
export class AdministrationController {
  constructor(private readonly adminService: AdministrationService ) {}

  @Get('create-key')
  async createKey(): Promise<any> {
    return await this.adminService.createKey();
  }
}
