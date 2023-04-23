import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';

@Schema({ versionKey: false })
export class Avatar extends AbstractDocument {
  @Prop({ type: Number, ref: 'User', required: true })
  user: number;

  @Prop()
  base64: string;

  @Prop()
  filename: string;
}

export const AvatarSchema = SchemaFactory.createForClass(Avatar);
