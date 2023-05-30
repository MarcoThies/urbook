import { IsNotEmpty } from 'class-validator';

export class UserIdDto {
  @IsNotEmpty() userId: number;
}
