import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { IncomingUserDto } from './dto/user.dto';
import { Response } from 'express';

@Controller('api/')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('users')
  @UseInterceptors(FileInterceptor('avatar'))
  async createUser(
    @Body() user: IncomingUserDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /^image\/(jpe?g|png|gif|jpg\+xml)$/i,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: true,
        }),
    )
    avatar: Express.Multer.File,
  ) {
    return this.usersService.createUser(user, avatar);
  }

  @Get('user/:id/avatar')
  async getUserAvatar(@Param('id') id: string, @Res() res: Response) {
    return this.usersService.getUserAvatar(id, res);
  }

  @Delete('user/:id/avatar')
  async deleteUserAvatar(@Param('id') id: string) {
    return this.usersService.deleteUserAvatar(id);
  }
}
