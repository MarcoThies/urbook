import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateBookDto {
  @IsNotEmpty()
  @IsString()
  child_name: string;

  @IsNotEmpty()
  @IsString()
  child_favColor: string;

  @IsNotEmpty()
  @IsString()
  child_favAnimals: string;

  @IsNotEmpty()
  @IsNumber()
  child_age: number;

  @IsNotEmpty()
  @IsString()
  child_country: string;

  @IsNotEmpty()
  @IsString()
  child_language: string;

  @IsNotEmpty()
  @IsString()
  child_gender: string;

  @IsNotEmpty()
  @IsString()
  topic_moralType: string;

  @IsNotEmpty()
  @IsNumber()
  topic_chapterCount: number;

  @IsNotEmpty()
  @IsString()
  topic_imageStyle: string;

  @IsNotEmpty()
  @IsString()
  topic_specialTopic: string;

}