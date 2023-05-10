import { IsNotEmpty } from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty() childName: string;
  @IsNotEmpty() childAge: string;
  @IsNotEmpty() topic: string;
}