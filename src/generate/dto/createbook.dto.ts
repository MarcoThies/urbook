import { IsNotEmpty } from 'class-validator';
import { ChildInfo } from "../interfaces/childinfo.interface";
import { TopicInfo } from "../interfaces/topicinfo.interface";

export class CreateBookDto {
  @IsNotEmpty() child: ChildInfo;
  @IsNotEmpty() topic: TopicInfo;
}