import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BooksEntity } from "../_shared/entities/books.entity";

@Injectable()
export class ManageService {
  constructor(
    @InjectRepository(BooksEntity)
    private readonly booksRepo: Repository<BooksEntity>,
  ) {}

  public async listBooks(): Promise<BooksEntity[]> {
    // TODO: Only give books that are related to user
    return await this.booksRepo.find();
  }
}
