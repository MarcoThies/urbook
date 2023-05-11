import { Console } from "console";
import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb, PageSizes} from "../../node_modules/pdf-lib";

export class PdfGeneratorSubservice {
  constructor() {
  }

  //define PDF attributes
  private pdfDoc;
  private fontTR
  private fontTRB;
  private pageDimensions;
  private numberOfPages;


  public async createA5Book(numberOfPages : number) : Promise<string> {
    this.pdfDoc = await PDFDocument.create();
    this.fontTR = await this.pdfDoc.embedFont(StandardFonts.TimesRoman);
    this.fontTRB = await this.pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    this.pageDimensions = [PageSizes.A5[1], PageSizes.A5[0] ] as [number, number];
    this.numberOfPages = numberOfPages;

    await this.addCoverPage();

    for (var i = 1; i < numberOfPages; i++) {
      await this.addPage(i);
      console.log('Page ' + i + ' generated.');
    }
      
    await this.addLastPage();
    console.log("generated");
    

    const pdfBytes = await this.pdfDoc.save();
    this.writeFile(pdfBytes);
    
    console.log("saved");
    return "test";
  }

  private async addCoverPage() {
    const page = this.pdfDoc.addPage(this.pageDimensions);
    await this.addImage(page, this.getImageLink(0), 0);
    this.addText(page, "Connies Schneeabenteuer", 50, this.pageDimensions[1] - 50, 30, this.fontTRB);
  }

  private async addLastPage() {
    const page = this.pdfDoc.addPage(this.pageDimensions);
    await this.addImage(page, this.getImageLink(100), 0);
    const text = "Das wars";
    this.addText(page, text, 200, 100, 30, this.fontTR);
  }

  private async addPage(pageNumber : number) {

    if(this.getCurrentPageType_alternating(pageNumber) == 'text_left') {
      console.log("text left")
      const page = this.pdfDoc.addPage(this.pageDimensions);
      await this.addImage(page, this.getImageLink(100), 100);
      const text = "Es war einmal ein " + (pageNumber) + "ter Beispieltext udn er geht noch weiter weil wir mal schauen wollen, was eigentlich mit Zeilenumbrüchen passiert undso weiter und so fort";
      this.addText(page, text, 50, 100, 15, this.fontTR);
      this.addText(page, pageNumber.toString(), 100, 20, 15, this.fontTR);
    }
    else if(this.getCurrentPageType_alternating(pageNumber) == 'text_right') {
      console.log("text right")
      const page = this.pdfDoc.addPage(this.pageDimensions);
      await this.addImage(page, this.getImageLink(100), 101);
      const text = "Es war einmal ein " + (pageNumber) + "ter Beispieltext udn er geht noch weiter weil wir mal schauen wollen, was eigentlich mit Zeilenumbrüchen passiert undso weiter und so fort";
      this.addText(page, text, 50, 100, 15, this.fontTR);
      this.addText(page, pageNumber.toString(), this.pageDimensions[0] - 100, 20, 15, this.fontTR);
    }
    else if(this.getCurrentPageType_alternating(pageNumber) == 'image_left') {
      console.log("image left")
      const page = this.pdfDoc.addPage(this.pageDimensions);
      await this.addImage(page, this.getImageLink(pageNumber), 0);
      this.addText(page, pageNumber.toString(), 100, 20, 15, this.fontTR);
    }
    else if(this.getCurrentPageType_alternating(pageNumber) == 'image_right') {
      console.log("image right")
      const page = this.pdfDoc.addPage(this.pageDimensions);
      await this.addImage(page, this.getImageLink(pageNumber), 0);
      this.addText(page, pageNumber.toString(), this.pageDimensions[0] - 100, 20, 15, this.fontTR);
    }

  }

  private addText(page : PDFPage, text : string, xpos : number, ypos : number, fontSize : number, font : PDFFont) {
    page.drawText(text, {
      x: xpos,
      y: ypos,
      size: fontSize,
      font: font,
      color: rgb(1, 0.53, 0.21),
    })
  }

  private async addImage(page : PDFPage, imagePath : string, offset : number) {
    const { width, height } = page.getSize();
    const pngImageBytes = await fetch(imagePath).then((res) => res.arrayBuffer())
    const pngImage = await this.pdfDoc.embedPng(pngImageBytes as ArrayBuffer);
    const pngDims = pngImage.scale(0.87);

    page.drawImage(pngImage, {
      x: 0 + offset,
      y: 0,
      width: pngDims.width,
      height: pngDims.height,
    })

  }

  private getImageLink(id : number) : string {

    switch (id) {
      case 0:
        return "https://i.postimg.cc/qRr3YSx1/book4.png";
      case 1:
        return "https://i.postimg.cc/FRYwck05/book2.png";
      case 2:
        return "https://i.postimg.cc/FRYwck05/book2.png";
      case 3:
        return "https://i.postimg.cc/6QnZMtn7/book3.png";
      case 4:
        return "https://i.postimg.cc/6QnZMtn7/book3.png";
      case 5:
        return "https://i.postimg.cc/qRr3YSx1/book4.png";
      case 6:
        return "https://i.postimg.cc/qRr3YSx1/book4.png";
      case 7:
        return "https://i.postimg.cc/FRYwck05/book2.png";
      case 8:
        return "https://i.postimg.cc/FRYwck05/book2.png";
      case 100:
        return "https://i.postimg.cc/Dy8TB28v/book0.png";
      case 101:
        return "https://i.postimg.cc/sXJYXrN1/book00.png";
    }
  }
  
  private getCurrentPageType_alternating(pageNumber : number) : string {

    if (pageNumber == 0)
      return 'cover';
    if (pageNumber == this.numberOfPages)
      return 'backside';
    else {
      switch(pageNumber % 4) {
        case 1:
          return 'text_left';
        case 2:
          return 'image_right';
        case 3:
          return 'image_left';
        case 0:
          return 'text_right';
      }
    }
  }

  public async writeFile(content : Uint8Array) : Promise<boolean> {
    const fs = require('fs');

    fs.writeFile('D:/test.pdf', content, err => {
      if (err) {
        console.error(err);
        return false;
      }
      // file written successfully
    });

    return true;
  }

}