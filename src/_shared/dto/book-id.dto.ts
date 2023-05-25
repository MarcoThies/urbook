import { IsNotEmpty } from 'class-validator';

export class BookIdDto {
  @IsNotEmpty() isbn: string;
}