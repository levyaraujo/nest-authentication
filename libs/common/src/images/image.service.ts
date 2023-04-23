import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImageService {
  private readonly folderPath = './images';

  createDirectoryIfNotExists(folderPath: string): void {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
  }

  generateUniqueFilename(): string {
    const filename = `${uuidv4()}.png`;
    return filename;
  }

  saveImageToDisk(imagePath: string, imageData: Buffer): void {
    fs.writeFileSync(imagePath, imageData);
  }

  getBase64EncodedImage(imageData: Buffer): string {
    const base64 = imageData.toString('base64');
    return base64;
  }

  downloadImage(file: Express.Multer.File): {
    base64: string;
    filename: string;
  } {
    this.createDirectoryIfNotExists(this.folderPath);

    const imageData = file.buffer;
    const filename = this.generateUniqueFilename();
    const imagePath = path.join(this.folderPath, filename);

    this.saveImageToDisk(imagePath, imageData);

    const base64 = this.getBase64EncodedImage(imageData);
    return { base64, filename };
  }

  async saveUserAvatar(avatar: Express.Multer.File) {
    if (avatar) {
      return this.downloadImage(avatar);
    }
  }
}
