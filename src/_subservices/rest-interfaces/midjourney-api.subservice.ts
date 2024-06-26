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
      MaxWait: 350,
      ApiInterval: 350,
      Remix: false,
      Ws: true
    });

  }

  private imgQuality = 1; // 0.25 | 0.5 | 0.75 | 1 -> in .25 increments
  private suffix = ` --ar 2:1 --v 5.2 --q ${this.imgQuality}`;

  async requestImage(prompt: string): Promise<string | boolean> {

    try {
      console.log("\n\n... requesting new image");
      const imgGrid = await this.client.Imagine(
        prompt + this.suffix,
        (uri, progress) => {
          console.log(uri, progress);
        }
      );
      if (!imgGrid) {
        return false;
      }

      console.log("image grid generated", imgGrid.uri);
      return await this.upscaleImage(imgGrid, 1);

    } catch (error) {
      console.log("MIDJOURNEY ERROR", error);
      return false;
    }
  }


  async upscaleImage(imgGrid: MJMessage, imgIndx: 1|2|3|4): Promise<string|boolean> {
    console.log("... upscaling image");
    const upscaleData = await this.client.Upscale({
      index: imgIndx,
      msgId: imgGrid.id as string,
      hash: imgGrid.hash as string,
      content: imgGrid.content as string,
      flags: 0,
      loading: (uri, progress)=> {
        console.log(uri, progress);
      }
    });

    if(!upscaleData || !upscaleData.uri) {
      return false;
    }

    console.log("image upscaled", upscaleData.uri);
    return upscaleData.uri;
  }

}