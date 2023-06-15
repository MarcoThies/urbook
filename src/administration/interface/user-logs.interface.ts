export interface IUserLogs{
    id: number;
    level: string;
    message: string;
    trace: string;
    context: string;
    time: string;
    userId?: number;
    bookKey: string;
  }