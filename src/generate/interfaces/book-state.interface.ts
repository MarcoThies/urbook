export interface IBookState{
  bookId: string,
  status: IStatusInfo
}

interface IStatusInfo{
  code: number,
  status: string,
  kiHelper: string
}