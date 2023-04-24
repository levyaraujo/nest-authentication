import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class User extends AbstractDocument {
  @Prop({ type: Number })
  id: number;

  @Prop({ type: String })
  email: string;

  @Prop({ type: String })
  firstName: string;

  @Prop({ type: String })
  lastName: string;

  @Prop({ type: Date })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
