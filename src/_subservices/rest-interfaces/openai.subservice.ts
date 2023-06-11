import { Configuration, OpenAIApi } from "openai";
import { Injectable } from "@nestjs/common";
import { DatabaseLoggerService } from "../_shared/database-logger.service";

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

  public async promptGPT35(prompt: string) : Promise<string | boolean> {

    // send text prompt to chatGpt and get response
    try {
        let completion = await this.openai.createChatCompletion( {
            model: "gpt-3.5-turbo",
            messages: [{role: "user", content: prompt}],
            max_tokens: 2000,
            temperature: 0.5,
            presence_penalty: 0.5,
            frequency_penalty: 1
        });
        const text = completion.data.choices[0].message?.content as string;
        console.log("\nPrompt:",prompt);
        console.log("\nResult:",text+"\n\n");
        return text;

    } catch (error) {
        console.log(error);
    }
    return false;

  }

  public async promptDavinci(prompt: string) : Promise<string | boolean> {
    // send text prompt to chatGpt and get response
    try {
      let completion = await this.openai.createCompletion( {
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 2000,
        temperature: 0.5,
        presence_penalty: 0.5,
        frequency_penalty: 1
      });
      const text = completion.data.choices[0].text as string;

      console.log("\nPrompt:\n",prompt);
      console.log("\nResult:\n",text+"\n\n");

      return text;

    } catch (error) {
      console.log(error);
    }
    return false;

  }

}