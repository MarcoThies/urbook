import { Controller, Get, UseGuards } from "@nestjs/common";
import { GenerateService } from "./generate.service";
import { AuthGuard } from "@nestjs/passport";
import { UserTypeGuard } from "../authentification/roles/type.guard";


@Controller('generate')
export class GenerateController {
  constructor(private readonly generateService: GenerateService) {}


  // DEMO REQUEST FOR PDF FILE GENERATION
  @UseGuards(
    AuthGuard('jwt'),
    UserTypeGuard('admin', 'user')
  )
  @Get('pdf')
  async generatePdf() {
    return await this.generateService.generatePdf();
  }

}
