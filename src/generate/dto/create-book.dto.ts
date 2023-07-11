import { IsNotEmpty, IsOptional, IsNumber, IsString } from "class-validator";

export class CreateBookDto {
  @IsNotEmpty()
  @IsString()
  char_name: string;

  @IsNotEmpty()
  @IsString()
  char_gender: string;

  @IsNotEmpty()
  @IsNumber()
  char_age: number;

  @IsNotEmpty()
  @IsNumber()
  opt_chapterCount: number;

  @IsOptional()
  @IsString()
  opt_topic?: string;

  @IsOptional()
  @IsString()
  opt_sidekick?: string;

  @IsOptional()
  @IsString()
  opt_place?: string;

  @IsOptional()
  @IsString()
  opt_color?: string;

  @IsOptional()
  @IsString()
  opt_moral?: string;
}