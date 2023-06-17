import { IStatusInfo } from "../../_shared/utils";

export interface IUserData{
  userId: number,
  admin: boolean,
  lastUsed: string,
  created: string,
  books: IBookInfo[]
}

export interface IBookInfo {
  title: string,
  bookId: string,
  created: string,
  chapterCount: number,
  state: IStatusInfo
}