import { Configuration, OpenAIApi } from "openai";
import { Injectable } from "@nestjs/common";
import { AiContent } from "./interfaces/ai-content.interface";

@Injectable()
export class OpenAi {
  constructor() {
  }

  private configuration = new Configuration({
    organization: process.env.OPENAI_API_ORG,
    apiKey: process.env.OPENAI_API_KEY
    });
  private openai = new OpenAIApi(this.configuration);

  public async getResponse(prompt: string, aiContent: AiContent) : Promise<string | boolean> {

    // send text prompt to chatGpt and get response
    try {
      console.log("creation triggered (" + prompt.substring(0,20) + "):\n");
        let completion = await this.openai.createChatCompletion( {
            model: "gpt-3.5-turbo",
            messages: [{role: "user", content: prompt}], 
            max_tokens: 2000,
            temperature: 1.2,
            presence_penalty: 0,
            frequency_penalty: 0
        });
        console.log("generation completed: \n" + (completion.data.choices[0].message?.content as string).substring(0,100));
        aiContent.text = completion.data.choices[0].message?.content as string;
        console.log(aiContent.text);
        return aiContent.text;

    } catch (error) {
        console.log(error);
    }
    return false;

  }

}