import { Controller, Post, Body, UseGuards, Get, Request, HttpException, UnauthorizedException } from "@nestjs/common";
import { GenerateService } from "./generate.service";
import { CreateBookDto } from "./dto/create-book.dto";
import { BookIdInterface } from "./interfaces/book-id.interface";
import { AuthGuard } from "@nestjs/passport";
import { UserTypeGuard } from "../authentification/roles/type.guard";
import { RegenerateChapterDto } from "./dto/regenerate-chapter.dto";

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
    public async create(@Body() createBookDto: CreateBookDto, @Request() req): Promise<BookIdInterface> {
      const currUser = req.user;
      if(!currUser) new UnauthorizedException('User missing');
      return await this.generateService.create(createBookDto, currUser);
    }
    @Post("regenerate-chapter-text")
    public async regenerateChapterText(@Body() regenerateChapterDto: RegenerateChapterDto, @Request() req): Promise<BookIdInterface> {
      const currUser = req.user;
      if(!currUser) new UnauthorizedException('User missing');
      return this.generateService.regenerateChapterText(regenerateChapterDto, currUser);
    }
    @Post("regenerate-chapter-image")
    public async regenerateChapterImage(@Body() regenerateChapterDto: RegenerateChapterDto, @Request() req): Promise<BookIdInterface> {
      const currUser = req.user;
      if(!currUser) new UnauthorizedException('User missing');
      return this.generateService.regenerateChapterImage(regenerateChapterDto, currUser);
    }
}
