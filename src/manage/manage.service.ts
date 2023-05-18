import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BooksEntity } from "../_shared/entities/books.entity";
import { DataManagerSubservice } from "../_subservices/data-manager.subservice";
import { ApiKeyEntity } from "../_shared/entities/api-keys.entity";

@Injectable()
export class ManageService {
  constructor(
    private readonly dataManager: DataManagerSubservice,
  ) {}

  public async listBooks(user: ApiKeyEntity): Promise<BooksEntity[]> {
    return await this.dataManager.getBookList(user);
  }
}
