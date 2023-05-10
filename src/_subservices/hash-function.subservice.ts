import * as bcrypt from "bcrypt";

export class HashFunctionSubservice {
  constructor() {
  }

  public async hash(value: string) : Promise<string> {
    return await bcrypt.hash(value, process.env.APISALT);
  }
}