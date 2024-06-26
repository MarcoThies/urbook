import { IsNotEmpty, IsString, IsNumber, IsEnum } from "class-validator";


export enum UsageEventTypes {
  Forward = "forward",
  Backward = "backward",
  Finishing = "finishing",
  Starting = "starting"
}

export class GetUsageDto {
  @IsNotEmpty()
  @IsString()
  bookId: string;

  @IsNotEmpty()
  @IsNumber()
  chapterNbr: number;

  @IsNotEmpty()
  @IsEnum(UsageEventTypes)
  eventType: UsageEventTypes;
}
