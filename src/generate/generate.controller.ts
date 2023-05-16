import { Controller, Post, Body } from '@nestjs/common';
import { GenerateService } from "./generate.service";
import { CreateBookDto } from "../generate/dto/createbook.dto";
import { BookIdInterface } from "./interfaces/book-id.interface";
import { AuthGuard } from "@nestjs/passport";
import { UserTypeGuard } from "../authentification/roles/type.guard";

@UseGuards(
  AuthGuard('jwt'),
  UserTypeGuard('admin', 'user')
)
@Controller('generate')
export class GenerateController {
    constructor(private readonly generateService: GenerateService) {
    }
    @Post('create-new')
    public async create(@Body() createBookDto: CreateBookDto): Promise<BookIdInterface> {
      return await this.generateService.create(createBookDto);
    }
    // DEMO REQUEST FOR PDF FILE GENERATION
    @Get('pdf')
    async generatePdf() {
      return await this.generateService.generatePdf();
    }
}
