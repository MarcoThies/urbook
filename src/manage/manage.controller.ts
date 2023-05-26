import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Request,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
  Body,
  Post
} from "@nestjs/common";
import { ManageService } from "./manage.service";
import { BooksEntity } from "../_shared/entities/books.entity";
import { AuthGuard } from "@nestjs/passport";
import { UserTypeGuard } from "../authentification/roles/type.guard";
import { BookIdDto } from "../_shared/dto/book-id.dto";
import { DeletedBookInterface } from "./interfaces/delete-book.interface";

@UseGuards(
  AuthGuard('jwt'),
  UserTypeGuard('admin', 'user')
)
@Controller('manage')
export class ManageController {
  constructor(private readonly manageService: ManageService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('list-books')
  public async listBooks(@Request() req) : Promise<BooksEntity[]> {
    const currUser = req.user;
    if(!currUser) new UnauthorizedException('User missing');
    return await this.manageService.listBooks(currUser);
  }

  @Post('delete-book')
  public async deleteBook(@Body() bookIdDto: BookIdDto, @Request() req): Promise<DeletedBookInterface> {
    const currUser = req.user;
    if(!currUser) new UnauthorizedException('User missing');
    return await this.manageService.deleteBook(currUser, bookIdDto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('book')
  public async getBook(@Body() bookIdDto: BookIdDto, @Request() req): Promise<BooksEntity> {
    const currUser = req.user;
    if(!currUser) new UnauthorizedException('User missing');
    return await this.manageService.getBook(currUser, bookIdDto);
  }

  @Post('pdf')
  public async getPdf(@Body() bookIdDto: BookIdDto, @Request() req): Promise<BooksEntity> {
    const currUser = req.user;
    if(!currUser) new UnauthorizedException('User missing');
    return await this.manageService.getPdf(currUser, bookIdDto);
  }
}
