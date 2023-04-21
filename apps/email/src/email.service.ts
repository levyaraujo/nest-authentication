import { Injectable, Logger } from '@nestjs/common';
import { rmqDto } from 'apps/users/src/dto/rabbitmq-user.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendEmail(data: rmqDto) {
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: 'lev0x79@gmail.com',
      to: data.userEmail,
      subject: 'Account created',
      text: `Hello, ${data.firstName}! Your account has been created successfully!`,
    });

    this.logger.log('Message sent: %s', info.messageId);
    this.logger.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
}
