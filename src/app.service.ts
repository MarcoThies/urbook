import { Injectable } from '@nestjs/common';
import { ApiKeyEntity } from "./_shared/entities/api-keys.entity";

export interface statusObj {
  status: boolean,
  timestamp: string
}

@Injectable()
export class AppService {
  requestStatus(): statusObj {
    return {
      timestamp: (new Date()).toLocaleDateString(),
      status: true
    };
  }
}
