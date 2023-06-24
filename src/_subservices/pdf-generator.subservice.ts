import { Injectable } from '@nestjs/common';
import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb, PageSizes} from "pdf-lib";
import { BooksEntity } from "./_shared/entities/books.entity";
import { DataManagerService } from "./_shared/data-manager.service";
import { DatabaseLoggerService } from "./_shared/database-logger.service";

@Injectable()
export class PdfGeneratorSubservice {
  constructor(
    private readonly dataManager : DataManagerService,
    private readonly logManager : DatabaseLoggerService,
  ) {}

  // declare PDF attributes
  private pdfDoc;
  private textFont
  private titleFont;
  private pageDimensions;
  private numberOfPages;
  private book;
  private coverImage;

  private gradients: any = {
    left: "./src/_assets/gradient-left.png",
    right: "./src/_assets/gradient-right.png",
  }
  // -------------------------------------------------------------------------------------------------------
  // --- 1. Generation of book attributes, orchestration of book generation and PDF export -----------------
  // -------------------------------------------------------------------------------------------------------

  // generate PDF in A5 format
  public async createA5Book(book: BooksEntity) : Promise<boolean> {
    // define PDF attributes
    this.pdfDoc = await PDFDocument.create();
    this.textFont = await this.pdfDoc.embedFont(StandardFonts.Helvetica);
    this.titleFont = await this.pdfDoc.embedFont(StandardFonts.HelveticaBold);
    this.pageDimensions = [PageSizes.A5[1], PageSizes.A5[0] ] as [number, number];
    this.numberOfPages = book.chapters.length * 2;
    this.book = book;

    this.coverImage = this.book.chapters[this.book.chapters.length-1].imageUrl;

    // add cover page
    await this.addCoverPage();
    await this.logManager.log(`Cover generated`, __filename, "PDF", book);

    // add all pages with content
    for (let i = 1; i <= this.numberOfPages; i++) {
      await this.addPage(i);
    }
    await this.logManager.log(`${this.numberOfPages} pages where generated`, __filename, "PDF", book);

    // add backside of book
    await this.addLastPage();
    await this.logManager.log("Last page generated", __filename, "PDF", book);
    
    // write PDf into file
    const pdfBytes = await this.pdfDoc.save();

    const fileName = book.title + '-v2' + '.pdf'
    const path = "."+this.dataManager.getBookPath(book);

    const pdfSuccessfullySaved = await this.dataManager.writeFile(pdfBytes, path, fileName);

    if (pdfSuccessfullySaved){
      await this.logManager.log(`File saved to ${path+fileName}!`,__filename, "PDF", book);
      console.log("PDF saved");
    }

    return pdfSuccessfullySaved;

  }
  // -------------------------------------------------------------------------------------------------------
  // --- 2. methods to add A5 cover, content pages and backside of book ------------------------------------
  // --- - pages are primarily text or image pages and utilise addTextPage or addImagePage which in turn  --
  // ---   use the content adding functions in section 3                                                  --
  // --- - the schematics in which pages and content is organised are procided by utility method          --
  // -------------------------------------------------------------------------------------------------------

  private async addCoverPage() {
    const page = this.pdfDoc.addPage(this.pageDimensions);
    await this.addImage(page, this.coverImage, 0.55);
    this.addTitle(page, this.book.title, 50, this.pageDimensions[1] - 210, 30, 400);
  }

  private async addPage(pageNumber : number) {

    switch(this.getCurrentPageType_alternating(pageNumber)) {
      case 'text_left': {
        const pageText = this.book.chapters[(pageNumber - 1) / 2].paragraph
        // const bgImageUrl = "https://i.postimg.cc/nzGFWnVy/bg-text-l.png"
        const chapterImageUrl = this.book.chapters[(pageNumber - 1) / 2].imageUrl
        await this.addTextPage(pageNumber, pageText, this.pageDimensions[0]-180, 80, 100, this.gradients.left, chapterImageUrl);
        break;
      }
      case 'text_right': {
        const pageText = this.book.chapters[(pageNumber - 2) / 2].paragraph
        // const bgImageUrl = "https://i.postimg.cc/MHZ62gvv/bg-text-r.png"
        const chapterImageUrl = this.book.chapters[(pageNumber - 2) / 2].imageUrl
        await this.addTextPage(pageNumber, pageText, -this.pageDimensions[0], 230, this.pageDimensions[0] - 100, this.gradients.right, chapterImageUrl);
        break;
      }
      case 'image_left': {
        const chapterImageUrl = this.book.chapters[(pageNumber - 1) / 2].imageUrl
        await this.addImagePage(pageNumber, chapterImageUrl, 0, 100);
        break;
      }
      case 'image_right': {
        const chapterImageUrl = this.book.chapters[(pageNumber - 2) / 2].imageUrl
        await this.addImagePage(pageNumber, chapterImageUrl, -180, this.pageDimensions[0] - 100);
        break;
      }
    } 
  }

  private async addLastPage() {
    const page = this.pdfDoc.addPage(this.pageDimensions);
    await this.addImage(page, this.coverImage, 0.55, this.pageDimensions[0]-180);
    await this.addImage(page, this.gradients.left, 1);
    const pageText = "urContent GmbH \nUnter den Linden 1 \n10117 Berlin \ninfo@urBook.de \nwww.urbook.de";
    this.addText(page, pageText, 100, 160, 10, 100, 12);
  }

  private async addTextPage(pageNumber : number, pageText : string, imageOffset: number, xPosText : number, xPosPageNumber : number, bgImageURL : string, chapterImageUrl : string) {
    const page = this.pdfDoc.addPage(this.pageDimensions);
    await this.addImage(page, chapterImageUrl, 0.55, imageOffset);
    await this.addImage(page, bgImageURL, 1);
    await this.addText(page, pageText, xPosText, this.pageDimensions[1] - 80, 15);
    await this.addPageNumber(page, pageNumber.toString(), xPosPageNumber);
  }

  private async addImagePage(pageNumber : number, chapterImageUrl : string, imageOffset : number, xPosPageNumber : number) {
    const page = this.pdfDoc.addPage(this.pageDimensions);
    await this.addImage(page, chapterImageUrl, 0.55, imageOffset);
    await this.addPageNumber(page, pageNumber.toString(), xPosPageNumber);
  }

  // -------------------------------------------------------------------------------------------------------
  // --- 3. methods to add content onto pages --------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------

  private addTitle(page : PDFPage, text : string, xpos : number, ypos : number, fontSize : number, maxTextWidth : number = 300) {
    // page.drawRectangle({
    //   x: xpos - 10,
    //   y: ypos - 15,
    //   width: maxTextWidth+20,
    //   height: 50,
    //   borderWidth: 0,
    //   color: rgb(1,1,1)
    // });
    page.drawText(text, {
      x: xpos +2,
      y: ypos -2,
      size: fontSize,
      font: this.titleFont,
      color: rgb(1, 1, 1),
      maxWidth: maxTextWidth,
      lineHeight: fontSize*1.5

    });
    page.drawText(text, {
      x: xpos,
      y: ypos,
      size: fontSize,
      font: this.titleFont,
      color: rgb(152/255, 55/255, 41/255),
      maxWidth: maxTextWidth,
      lineHeight: fontSize*1.5
    });
  }

  private addText(page : PDFPage, text : string, xpos : number, ypos : number, fontSize : number, maxTextWidth = 300, lineHeight = fontSize*1.5) {
    page.drawText(text, {
      x: xpos,
      y: ypos,
      size: fontSize,
      font: this.textFont,
      color: rgb(0, 0, 0),
      maxWidth: maxTextWidth,
      lineHeight: lineHeight
    });
  }

  private addPageNumber(page : PDFPage, text : string, xpos : number) {
    page.drawRectangle({
      x: xpos - 11,
      y: 0,
      width: 30,
      height: 30,
      borderWidth: 0,
      color: rgb(0,0,0)
    });

    const textPos = (parseInt(text) > 9) ? xpos - 5 : xpos;

    page.drawText(text, {
      x: textPos,
      y: 10,
      size: 15,
      font: this.textFont,
      color: rgb(1, 1, 1)
    })
  }

  private async addImage(page : PDFPage, imagePath : string, scale : number, offset : number = 0) {

    // get image from either weblink or file
    let pngImageBytes: Buffer;
    if (imagePath && imagePath.includes('https:')){
      pngImageBytes = await fetch(imagePath).then((res) => res.arrayBuffer()) as Buffer;
    } else {
      pngImageBytes = await this.dataManager.readFile(imagePath) as Buffer;
    }
    
    // embed image into PDF
    const pngImage = await this.pdfDoc.embedPng(pngImageBytes as ArrayBuffer);

    // draw image onto page
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

  // provide schematics of how content pages are organised in book
  private getCurrentPageType_alternating(pageNumber : number) : string {
    let returnPosition = "";
    switch(pageNumber % 4) {
      case 1:
        returnPosition= 'text_left';
        break;
      case 2:
        returnPosition= 'image_right';
        break;
      case 3:
        returnPosition= 'image_left';
        break;
      case 0:
        returnPosition= 'text_right';
        break;
    }

    return returnPosition;
  }
}