import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { RmqModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RABBITMQ_URI: Joi.string().required(),
        RABBITMQ_EMAIL_QUEUE: Joi.string().required(),
      }),
    }),
    RmqModule,
  ],
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailModule {}
