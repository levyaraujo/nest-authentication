import { EMAIL_SERVICE, RabbitMQModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as Joi from 'joi';
import { EmailController } from '../src/email.controller';
import { EmailService } from '../src/email.service';
import { incomingMessageDto } from '../src/dto/message.dto';
import * as crypto from 'crypto';

describe('EmailController', () => {
  let emailController: EmailController;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validationSchema: Joi.object({
            RABBITMQ_URI: Joi.string().required(),
            RABBITMQ_EMAIL_QUEUE: Joi.string().required(),
          }),
        }),
        RabbitMQModule.register({
          name: EMAIL_SERVICE,
        }),
      ],
      controllers: [EmailController],
      providers: [EmailService],
    }).compile();
    emailController = app.get<EmailController>(EmailController);
  });

  it('should return the messageId as the user email hash', async () => {
    const data: incomingMessageDto = {
      firstName: 'Levy',
      userEmail: 'lev0x79@gmail.com',
    };
    const hashedEmail = crypto
      .createHash('md5')
      .update(data.userEmail)
      .digest('hex');
    const sentMessage = await emailController.handleUserSendEmail(data);
    expect(sentMessage.messageId).toBe(hashedEmail);
  });
});
