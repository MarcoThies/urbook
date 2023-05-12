import { Controller, Post, Body } from '@nestjs/common';
import { GenerateService } from "./generate.service";
import { CreateBookDto } from "../generate/dto/createbook.dto";
import { BookIdInterface } from "./interfaces/book-id.interface";

@Controller('generate')
export class GenerateController {
    constructor(private readonly generateService: GenerateService) {
    }
  
    @Post('create-new')
    public async create(@Body() createBookDto: CreateBookDto): Promise<BookIdInterface> {
      return await this.generateService.create(createBookDto);
    }
}
