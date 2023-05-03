import { Injectable } from '@nestjs/common';

export interface statusObj {
  status: boolean,
  timestamp: string
}

@Injectable()
export class AppService {
  requestStatus(): statusObj {
    return {
      status: true,
      timestamp: (new Date()).toLocaleDateString()
    };
  }
}
