import { Controller, Get, Request, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ManageService } from "./manage.service";
import { BooksEntity } from "../_shared/entities/books.entity";
import { AuthGuard } from "@nestjs/passport";
import { UserTypeGuard } from "../authentification/roles/type.guard";

@Controller('manage')
export class ManageController {
  constructor(private readonly manageService: ManageService) {}

  @UseGuards(
    AuthGuard('jwt'),
    UserTypeGuard('admin', 'user')
  )
  @Get('list-books')
  public async listBooks(@Request() req) : Promise<BooksEntity[]> {
    const currUser = req.user;
    if(!currUser) new UnauthorizedException('User missing');
    return await this.manageService.listBooks(currUser);
  }
}
