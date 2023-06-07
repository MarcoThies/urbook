import { Injectable } from "@nestjs/common";

export interface statusObj {
  status: boolean,
  timestamp: string
}

@Injectable()
export class AppService {

  constructor() {}
  requestStatus(): statusObj {
    return {
      timestamp: (new Date()).toUTCString(),
      status: true
    };
  }


}
