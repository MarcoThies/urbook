import { Controller, Post, Body, UseGuards, Get, Request, HttpException, UnauthorizedException } from "@nestjs/common";
import { GenerateService } from "./generate.service";
import { CreateBookDto } from "./dto/create-book.dto";
import { IBookId } from "./interfaces/book-id.interface";
import { AuthGuard } from "@nestjs/passport";
import { UserTypeGuard } from "../authentification/roles/type.guard";
import { RegenerateChapterDto } from "./dto/regenerate-chapter.dto";
import { IBookState } from "./interfaces/book-state.interface";
import { BookIdDto } from "../_subservices/_shared/dto/book-id.dto";

@UseGuards(
  AuthGuard('jwt'),
  UserTypeGuard('admin', 'user')
)
@Controller('generate')
export class GenerateController {
    constructor(
      private readonly generateService: GenerateService
    ) {}
    @Post('create-new')
    public async create(@Body() createBookDto: CreateBookDto, @Request() req): Promise<IBookId> {
      return await this.generateService.create(createBookDto, req.user);
    }
    @Post("regenerate-chapter-text")
    public async regenerateChapterText(@Body() regenerateChapterDto: RegenerateChapterDto, @Request() req): Promise<IBookId> {
      return await this.generateService.regenerateChapterText(regenerateChapterDto, req.user);
    }
    @Post("regenerate-chapter-image")
    public async regenerateChapterImage(@Body() regenerateChapterDto: RegenerateChapterDto, @Request() req): Promise<IBookId> {
      return await this.generateService.regenerateChapterImage(regenerateChapterDto, req.user);
    }

    @Post("regenerate-book")
    public async regenerateBook(@Body() bookIdDto: BookIdDto, @Request() req): Promise<IBookState> {
      return await this.generateService.regenerateBook(bookIdDto.bookId, req.user);
    }

    @Post("check-status")
    public async checkStatus(@Body() bookIdDto: BookIdDto, @Request() req): Promise<IBookState> {
      return await this.generateService.checkStatus(bookIdDto.bookId, req.user);
    }

    @Post("abort")
    public async abortGeneration(@Body() bookIdDto: BookIdDto, @Request() req): Promise<Boolean> {
      return await this.generateService.abort(bookIdDto.bookId, req.user);
    }

    @Post("generate-pdf")
    public async generatePDF(@Body() bookIdDto: BookIdDto, @Request() req): Promise<IBookId> {
      return await this.generateService.generatePDF(bookIdDto.bookId, req.user);
    }
}
