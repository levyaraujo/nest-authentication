import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';

export function createMockMulterFileFromImage(
  filePath: string,
): Express.Multer.File {
  const filename = path.basename(filePath);
  const mimetype = `image/${path.extname(filePath).slice(1)}`;
  const file = fs.readFileSync(filePath);
  const size = Buffer.byteLength(file);
  const stream = new Readable();
  stream.push(file);
  stream.push(null);
  return {
    fieldname: 'file',
    originalname: filename,
    encoding: '7bit',
    mimetype,
    size,
    destination: '',
    filename,
    path: filePath,
    buffer: file,
    stream,
  };
}
