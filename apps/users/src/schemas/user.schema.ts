import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class User extends AbstractDocument {
  @Prop()
  id: number;

  @Prop()
  email: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  createdAt: Date;

  @Prop()
  avatarBase64: string;

  @Prop()
  avatarFileName: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
