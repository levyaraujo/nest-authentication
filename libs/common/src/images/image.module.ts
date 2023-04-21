import { Module } from '@nestjs/common';
import { ImageService } from './image.service';

@Module({
  imports: [],
  controllers: [],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
