import { Configuration, OpenAIApi } from "openai";
import { Injectable } from "@nestjs/common";
import { IOpenAiPromptMessage } from "../interfaces/openai-prompt.interface";
import {
  ICharacterPromptReturn,
  INewChapter,
  IOpenAiStoryData,
  IStoryPrompts
} from "../interfaces/story-data.interface";

@Injectable()
export class OpenAi {
  constructor(
  ) {}

  private configuration = new Configuration({
    organization: process.env.OPENAI_API_ORG,
    apiKey: process.env.OPENAI_API_KEY
  });

  private openai = new OpenAIApi(this.configuration);

  public async promptGPT(messages: IOpenAiPromptMessage[], functions : any, model: "gpt-3.5-turbo-16k" | "gpt-4" = "gpt-4", token= 1024){
    console.log("\nPrompt:\n", messages);
    // send text prompt to chatGpt and get response
    try {
      let completion = await this.openai.createChatCompletion( {
        model: model,
        messages: messages,
        functions: functions,
        function_call: {
          name: functions[0].name
        },
        top_p: 1,
        max_tokens: token,
        temperature: 0.5,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });
      if(typeof completion.data.choices[0].message?.function_call?.arguments === "undefined"){
        console.log(completion.data);
        return false;
      }

      const result = JSON.parse(completion.data.choices[0].message?.function_call?.arguments as string);
      if(!result){
        console.log(completion.data.choices[0].message?.function_call.arguments);
        return false;
      }

      console.log("\n\nDEBUG: parsed json: ", result);
      return result;

    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /*
  public async promptGPT35(messages: IOpenAiPromptMessage[], functions : any) : Promise<IOpenAiStoryData | ICharacterPromptReturn | IStoryPrompts | INewChapter | boolean> {
      console.log("\nPrompt:\n", messages);
    // send text prompt to chatGpt and get response
    try {
        let completion = await this.openai.createChatCompletion( {
            model: "gpt-3.5-turbo-16k",
            messages: messages,
            functions: functions,
            function_call: {
              name: functions[0].name
            },
            top_p: 1,
            max_tokens: 2048,
            temperature: 0.5,
            presence_penalty: 0.1,
            frequency_penalty: 0.1
        });
        if(typeof completion.data.choices[0].message?.function_call?.arguments === "undefined"){
          console.log(completion.data);
          return false;
        }

        const result = JSON.parse(completion.data.choices[0].message?.function_call?.arguments as string);
        if(!result){
          console.log(completion.data.choices[0].message?.function_call.arguments);
          return false;
        }

        console.log("\n\nDEBUG: parsed json: ", result);
        return result;

    } catch (error) {
        console.log(error);
        return false;
    }

  }
  public async promptGPT4(messages: IOpenAiPromptMessage[], functions : any) : Promise<IOpenAiStoryData | ICharacterPromptReturn | IStoryPrompts | INewChapter | boolean> {
      console.log("\nPrompt:\n", messages);
      // send text prompt to chatGpt and get response
      try {
          let completion = await this.openai.createChatCompletion( {
              model: "gpt-4",
              messages: messages,
              functions: functions,
              function_call: {
                  name: functions[0].name
              },
              top_p: 1,
              max_tokens: 2048,
              temperature: 0.5,
              presence_penalty: 0.1,
              frequency_penalty: 0.1
          });
          if(typeof completion.data.choices[0].message?.function_call?.arguments === "undefined"){
              console.log(completion.data);
              return false;
          }

          const result = JSON.parse(completion.data.choices[0].message?.function_call?.arguments as string);
          if(!result){
              console.log(completion.data.choices[0].message?.function_call.arguments);
              return false;
          }

          console.log("\n\nDEBUG: parsed json: ", result);
          return result;

      } catch (error) {
          console.log(error);
          return false;
      }

  }
  public async promptGPT35Short(messages: IOpenAiPromptMessage[], functions : any) : Promise<IOpenAiStoryData | ICharacterPromptReturn | IStoryPrompts | INewChapter | boolean> {
      console.log("\nPrompt:\n", messages);
      // send text prompt to chatGpt and get response
      try {
          let completion = await this.openai.createChatCompletion( {
              model: "gpt-3.5-turbo-16k",
              messages: messages,
              functions: functions,
              function_call: {
                  name: functions[0].name
              },
              top_p: 1,
              max_tokens: 300,
              temperature: 1,
              presence_penalty: 0,
              frequency_penalty: 0
          });
          if(typeof completion.data.choices[0].message?.function_call?.arguments === "undefined"){
              console.log(completion.data);
              return false;
          }

          const result = JSON.parse(completion.data.choices[0].message?.function_call?.arguments as string);
          if(!result){
              console.log(completion.data.choices[0].message?.function_call.arguments);
              return false;
          }

          console.log("\n\nDEBUG: parsed json: ", result);
          return result;

      } catch (error) {
          console.log(error);
          return false;
      }

  }


  }
  */
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
      return completion.data.choices[0].text as string;

    } catch (error) {
      console.log(error);
      return false;
    }

  }

}