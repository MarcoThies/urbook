import { IsNotEmpty, IsEmail } from 'class-validator';

export class VerifyMailDto {
  @IsNotEmpty()  id: number;
  @IsNotEmpty()  hash: string;
}