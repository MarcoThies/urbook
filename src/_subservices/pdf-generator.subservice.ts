import { Injectable } from '@nestjs/common';
import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb, PageSizes} from "pdf-lib";
import { BooksEntity } from "../_shared/entities/books.entity";
import { DataManagerSubservice } from "./data-manager.subservice";
import * as fs from "fs";

@Injectable()
export class PdfGeneratorSubservice {
  constructor(private readonly dataManager : DataManagerSubservice) {}

  // declare PDF attributes
  private pdfDoc;
  private textFont
  private titleFont;
  private pageDimensions;
  private numberOfPages;
  private book;

  // -------------------------------------------------------------------------------------------------------
  // --- 1. Generation of book attributes, orchestration of book generation and PDF export -----------------
  // -------------------------------------------------------------------------------------------------------

  // generate PDF in A5 format
  public async createA5Book(book: BooksEntity) : Promise<boolean> {
    // define PDF attributes
    this.pdfDoc = await PDFDocument.create();
    this.textFont = await this.pdfDoc.embedFont(StandardFonts.TimesRoman);
    this.titleFont = await this.pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    this.pageDimensions = [PageSizes.A5[1], PageSizes.A5[0] ] as [number, number];
    this.numberOfPages = book.chapters.length * 2 - 2; /// -2 is workaround for last chapter of dummy book not having imageURL yet, must get udpted!!!!!!!!!!
    this.book = book;

    // add cover page
    await this.addCoverPage();
    console.log("Cover generated");

    // add all pages with content
    for (var i = 1; i <= this.numberOfPages; i++) {
      await this.addPage(i);
    }
    console.log(this.numberOfPages, "content pages generated");
      
    // add backside of book
    await this.addLastPage();
    console.log("Last page generated");
    
    // write PDf into file
    const pdfBytes = await this.pdfDoc.save();

    const user_id = book.apiKeyLink.apiId;
    const book_id = book.isbn;
    const path = './exports/' + user_id + '/' + book_id + '/';
    const fileName = book.title + '-v2' + '.pdf'

    if (!fs.existsSync(path)){
      fs.mkdirSync(path, { recursive: true});
    }

    const pdfSuccessfullySaved = await this.dataManager.writeFile(pdfBytes, path, fileName);

    if (pdfSuccessfullySaved)
      console.log("PDF saved");

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
    await this.addImage(page, "https://i.postimg.cc/FRYwck05/book2.png", 0.87);
    this.addTitle(page, this.book.title, 50, this.pageDimensions[1] - 210, 30, 500);
  }

  private async addPage(pageNumber : number) {

    switch(this.getCurrentPageType_alternating(pageNumber)) {
      case 'text_left': {
        const pageText = this.book.chapters[(pageNumber - 1) / 2].paragraph
        const bgImageUrl = "https://i.postimg.cc/nzGFWnVy/bg-text-l.png"
        const chapterImageUrl = this.book.chapters[(pageNumber - 1) / 2].imageUrl
        await this.addTextPage(pageNumber, pageText, this.pageDimensions[0]-180, 80, 100, bgImageUrl, chapterImageUrl);
        break;
      }
      case 'text_right': {
        const pageText = this.book.chapters[(pageNumber - 2) / 2].paragraph
        const bgImageUrl = "https://i.postimg.cc/MHZ62gvv/bg-text-r.png"
        const chapterImageUrl = this.book.chapters[(pageNumber - 2) / 2].imageUrl
        await this.addTextPage(pageNumber, pageText, -this.pageDimensions[0], 230, this.pageDimensions[0] - 100, bgImageUrl, chapterImageUrl);
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
    await this.addImage(page, "https://i.postimg.cc/FRYwck05/book2.png", 0.87, this.pageDimensions[0]-180);
    await this.addImage(page, "https://i.postimg.cc/nzGFWnVy/bg-text-l.png", 1);
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

    // get image from either weblink or file
    var pngImageBytes : Buffer;
    if (imagePath.includes('https:'))
      pngImageBytes = await fetch(imagePath).then((res) => res.arrayBuffer()) as Buffer
    else {
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