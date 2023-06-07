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

  private imgQuality = 0.5 // 0.25 | 0.5 | 1

  async requestImage(prompt: string): Promise<string> {

    const imgGrid =  await this.client.Imagine(prompt+" --q "+this.imgQuality);
    if(!imgGrid) {
      throw new HttpException("Could not generate any Images", 500);
    }
    return await this.upscaleImage(imgGrid, 1);
  }


  async upscaleImage(imgGrid: MJMessage, imgIndx: number): Promise<string> {
    const upscaleData = await this.client.Upscale(
      imgGrid.content,
      imgIndx,
      imgGrid.id?imgGrid.id:"",
      imgGrid.hash?imgGrid.hash:""
    )

    if(!upscaleData || !upscaleData.uri) {
      throw new HttpException("Could not upscale the Image", 500);
    }

    return upscaleData.uri;
  }

}