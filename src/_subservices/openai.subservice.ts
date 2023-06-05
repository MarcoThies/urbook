import { Configuration, OpenAIApi } from "openai";
import { Injectable } from "@nestjs/common";
import { AiContent } from "./interfaces/ai-content.interface";
import { DatabaseLoggerService } from "./_shared/database-logger.service";

@Injectable()
export class OpenAi {
  constructor(
    dataLogger: DatabaseLoggerService
  ) {
  }

  private configuration = new Configuration({
    organization: process.env.OPENAI_API_ORG,
    apiKey: process.env.OPENAI_API_KEY
  });

  private openai = new OpenAIApi(this.configuration);

  public async getResponse(prompt: string, aiContent: AiContent) : Promise<string | boolean> {

    console.log("\nRequest started:\n", prompt);
    // send text prompt to chatGpt and get response
    try {
        let completion = await this.openai.createChatCompletion( {
            model: "gpt-3.5-turbo",
            messages: [{role: "user", content: prompt}], 
            max_tokens: 2000,
            temperature: 1.2,
            presence_penalty: 0,
            frequency_penalty: 0
        });
        aiContent.text = completion.data.choices[0].message?.content as string;

        console.log("\nResult:\n"+aiContent.text+"\n\n");

        return aiContent.text;

    } catch (error) {
        console.log(error);
    }
    return false;

  }

}