import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Avatar } from './schemas/avatar.schema';

@Injectable()
export class AvatarRepository extends AbstractRepository<Avatar> {
  protected readonly logger = new Logger(AvatarRepository.name);

  constructor(@InjectModel(Avatar.name) avatarModel: Model<Avatar>) {
    super(avatarModel);
  }
}
