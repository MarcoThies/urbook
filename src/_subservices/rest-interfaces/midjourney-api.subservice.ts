import { Midjourney } from "midjourney";
import { MJMessage } from "midjourney/src/interfaces/message";
import { HttpException, Injectable } from "@nestjs/common";

@Injectable()
export class MidjourneyApiSubservice {
  private client: Midjourney;

  constructor() {
    this.client = new Midjourney({
      ServerId: process.env.MID_SERVER,
      ChannelId: process.env.MID_CHANNEL,
      SalaiToken: process.env.MID_SALAI ? process.env.MID_SALAI:"",
      Debug: false,
      Ws:true,
    });
  }

  private imgQuality = 1; // 0.25 | 0.5 | 0.75 | 1 -> in .25 increments
  private suffix = "in the style of a children's storybook, colorful illustration --ar 2:1 --v 5.2 --style raw --q "+this.imgQuality;
  // private suffix = "--ar 2:1 --niji 5 --style expressive --q "+this.imgQuality;
  // private suffix = "--ar 2:1 --v 5.1 --q "+this.imgQuality;

  async requestImage(prompt: string): Promise<string | boolean> {
    console.log("\n\n... requesting new image");
    const imgGrid =  await this.client.Imagine(prompt+" "+this.suffix, (uri, progress)=>{
      console.log(uri, progress);
    });
    if(!imgGrid) {
      return false;
    }
    console.log("image generated", imgGrid);
    return await this.upscaleImage(imgGrid, 1);
  }


  async upscaleImage(imgGrid: MJMessage, imgIndx: number): Promise<string|boolean> {
    console.log("... upscaling image");
    const upscaleData = await this.client.Upscale(
      imgGrid.content,
      imgIndx,
      imgGrid.id?imgGrid.id:"",
      imgGrid.hash?imgGrid.hash:""
    )

    if(!upscaleData || !upscaleData.uri) {
      return false;
    }

    console.log("image upscaled", upscaleData.uri);
    return upscaleData.uri;
  }

}