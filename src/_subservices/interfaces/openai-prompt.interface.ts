export interface IOpenAiPromptMessage {
  role: messageRole;
  content: string;
}

export interface IOpenAiPromptFunction {
  name: string;
  description: string;
  type: string;
  subtype1: [string];
}

export enum messageRole {
  system = "system", user = "user", assistant = "assistant"
}