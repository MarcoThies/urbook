import { BooksEntity } from "../_shared/entities/books.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

export class BookGeneratorSubservice {
  constructor(
    @InjectRepository(BooksEntity)
    private readonly booksRepo : Repository<BooksEntity>
  ) {}

  public async generateNewBook(book: BooksEntity){
    // begin Book generation Prozess
  }
}