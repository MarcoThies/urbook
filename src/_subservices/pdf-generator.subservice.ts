import { Console } from "console";
import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb, PageSizes} from "pdf-lib";
import * as fs from "fs";
import { BooksEntity } from "../_shared/entities/books.entity";

export class PdfGeneratorSubservice {
  constructor() {
  }

  // declare PDF attributes
  private pdfDoc;
  private textFont
  private titleFont;
  private pageDimensions;
  private numberOfPages;

  // -------------------------------------------------------------------------------------------------------
  // --- 1. Generation of book attributes, orchestration of book generation and PDF export -----------------
  // -------------------------------------------------------------------------------------------------------

  // generate PDF in A5 format
  public async createA5Book(book: BooksEntity) : Promise<boolean> {
    // define PDF attributes
    const numberOfPages = book.chapters.length;
    this.pdfDoc = await PDFDocument.create();
    this.textFont = await this.pdfDoc.embedFont(StandardFonts.TimesRoman);
    this.titleFont = await this.pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    this.pageDimensions = [PageSizes.A5[1], PageSizes.A5[0] ] as [number, number];
    this.numberOfPages = numberOfPages;

    // add cover page
    await this.addCoverPage();
    console.log("Cover generated");

    // add all pages with content
    for (var i = 1; i < numberOfPages; i++) {
      await this.addPage(i);
      console.log('Page ' + i + ' generated.');
    }
      
    // add backside of book
    await this.addLastPage();
    console.log("Last page generated");
    
    // write PDf into file
    const pdfBytes = await this.pdfDoc.save();

    const user_id = 'USER-Q05R-7UF3-Z26N'
    const book_id = 'BOOK-Q05R-7UF3-Z26N'
    const path = './exports/' + user_id + '/' + book_id + '/';
    const fileName = 'Connies_Schneeabenteuer_' + 'v2' + '.pdf'

    if (!fs.existsSync(path)){
      fs.mkdirSync(path, { recursive: true});
    }

    console.log("PDF saved");
    return await this.writeFile(pdfBytes, path, fileName);

  }
  // -------------------------------------------------------------------------------------------------------
  // --- 2. methods to add A5 cover, content pages and backside of book ------------------------------------
  // --- - pages are primarily text or image pages and utilise addTextPage or addImagePage which in turn  --
  // ---   use the content adding functions in section 3                                                  --
  // --- - the schematics in which pages and content is organised are procided by utility method          --
  // -------------------------------------------------------------------------------------------------------

  private async addCoverPage() {
    const page = this.pdfDoc.addPage(this.pageDimensions);
    await this.addImage(page, this.getImageLink(0), 1);
    this.addTitle(page, "Connies Schneeabenteuer", 50, this.pageDimensions[1] - 210, 30, 500);
  }

  private async addPage(pageNumber : number) {

    switch(this.getCurrentPageType_alternating(pageNumber)) {
      case 'text_left': {
        await this.addTextPage(pageNumber, this.pageDimensions[0]-180, 80, 100, 100, 1);
        break;
      }
      case 'text_right': {
        await this.addTextPage(pageNumber, -this.pageDimensions[0], 230, this.pageDimensions[0] - 100, 101, -1);
        break;
      }
      case 'image_left': {
        await this.addImagePage(pageNumber, 0, 100);
        break;
      }
      case 'image_right': {
        await this.addImagePage(pageNumber, -180, this.pageDimensions[0] - 100);
        break;
      }
    }
  }

  private async addLastPage() {
    const page = this.pdfDoc.addPage(this.pageDimensions);
    await this.addImage(page, this.getImageLink(0), 0.87, this.pageDimensions[0]-180);
    await this.addImage(page, this.getImageLink(100), 1);
    const pageText = "urContent GmbH \nUnter den Linden 1 \n10117 Berlin \ninfo@urBook.de \nwww.urbook.de";
    this.addText(page, pageText, 100, 160, 10, 100, 12);
  }

  private async addTextPage(pageNumber : number, imageOffset: number, xPosText : number, xPosPageNumber : number, bgImageCode : number, imageNeighbor : number) {
    const page = this.pdfDoc.addPage(this.pageDimensions);
    await this.addImage(page, this.getImageLink(pageNumber+imageNeighbor), 0.87, imageOffset);
    await this.addImage(page, this.getImageLink(bgImageCode), 1);
    const pageText = "Es war einmal ein " + (pageNumber) + "ter Beispieltext und er geht noch weiter weil wir mal schauen wollen, was eigentlich mit Zeilenumbrüchen passiert undso weiter und so fort.";
    await this.addText(page, pageText, xPosText, this.pageDimensions[1] - 150, 15);
    await this.addPageNumber(page, pageNumber.toString(), xPosPageNumber);
  }

  private async addImagePage(pageNumber : number, imageOffset : number, xPosPageNumber : number) {
    const page = this.pdfDoc.addPage(this.pageDimensions);
    await this.addImage(page, this.getImageLink(pageNumber), 0.87, imageOffset);
    await this.addPageNumber(page, pageNumber.toString(), xPosPageNumber);
  }

  // -------------------------------------------------------------------------------------------------------
  // --- 3. methods to add content onto pages --------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------

  private addTitle(page : PDFPage, text : string, xpos : number, ypos : number, fontSize : number, maxTextWidth : number = 300) {
    page.drawText(text, {
      x: xpos,
      y: ypos,
      size: fontSize,
      font: this.titleFont,
      color: rgb(1, 0.53, 0.21),
      maxWidth: maxTextWidth
    })
  }

  private addText(page : PDFPage, text : string, xpos : number, ypos : number, fontSize : number, maxTextWidth = 300, lineHeight = fontSize*1.5) {
    page.drawText(text, {
      x: xpos,
      y: ypos,
      size: fontSize,
      font: this.textFont,
      color: rgb(1, 0.53, 0.21),
      maxWidth: maxTextWidth,
      lineHeight: lineHeight
    })
  }

  private addPageNumber(page : PDFPage, text : string, xpos : number) {
    page.drawText(text, {
      x: xpos,
      y: 20,
      size: 15,
      font: this.textFont,
      color: rgb(1, 0.53, 0.21)
    })
  }

  private async addImage(page : PDFPage, imagePath : string, scale : number, offset : number = 0) {
    const { width, height } = page.getSize();
    const pngImageBytes = await fetch(imagePath).then((res) => res.arrayBuffer())
    const pngImage = await this.pdfDoc.embedPng(pngImageBytes as ArrayBuffer);
    const pngDims = pngImage.scale(scale);

    page.drawImage(pngImage, {
      x: 0 + offset,
      y: 0,
      width: pngDims.width,
      height: pngDims.height,
    })
  }

  // -------------------------------------------------------------------------------------------------------
  // --- 4. utility methods --------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------

  // get iamge files to generate book with (temporary until they are available from DB)
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
        return "https://i.postimg.cc/nzGFWnVy/bg-text-l.png";
      case 101:
        return "https://i.postimg.cc/MHZ62gvv/bg-text-r.png";
    }
  }
  
  // provide schematics of how content pages are organised in book
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

  public async writeFile(content : Uint8Array, path : string, fileName : string) : Promise<boolean> {
    const fs = require('fs');

    fs.writeFile(path + fileName, content, err => {
      if (err) {
        console.error(err);
        return false;
      }
    });

    return true;
  }

}