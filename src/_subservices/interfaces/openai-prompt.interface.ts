export interface IOpenAiPromptMessage {
  role: messageRole;
  content: string;
}

export enum messageRole {
  system = "system", user = "user", assistant = "assistant"
}