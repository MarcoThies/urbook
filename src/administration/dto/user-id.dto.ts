import { IsNotEmpty, IsNumber } from "class-validator";

export class UserIdDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
