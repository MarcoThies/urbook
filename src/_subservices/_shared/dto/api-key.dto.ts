import { IsNotEmpty, IsString } from "class-validator";

export class ApiKeyDto {
  @IsNotEmpty()
  @IsString()
  apiKey: string;
}
