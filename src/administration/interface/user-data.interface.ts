
export interface IUserData{
  userId: number,
  admin: boolean,
  lastUsed: string,
  created: string,
  books: BookInfo[]
}

export interface BookInfo{
  title: string,
  isbn: string,
  created: string,
  chapterCount: number,
  state: number
}