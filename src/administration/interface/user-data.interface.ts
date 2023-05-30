
export interface IUserData{
  userId: number,
  admin: boolean,
  lastUsed: string,
  created: string,
  books: IBookInfo[]
}

export interface IBookInfo {
  title: string,
  isbn: string,
  created: string,
  chapterCount: number,
  state: number
}