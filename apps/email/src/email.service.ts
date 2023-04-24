import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { incomingMessageDto } from './dto/message.dto';
import { sendEmailResponseDto } from './dto/sendEmailResponse.dto';
import * as crypto from 'crypto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendEmail(data: incomingMessageDto): Promise<sendEmailResponseDto> {
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

    try {
      const info = await transporter.sendMail({
        from: 'lev0x79@gmail.com',
        to: data.userEmail,
        subject: 'Account created',
        text: `Hello, ${data.firstName}! Your account has been created successfully!`,
        messageId: crypto
          .createHash('sha256')
          .update(data.userEmail)
          .digest('hex'),
      });

      this.logger.log(`Message sent: ${info.messageId}`);
      this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);

      return {
        messageId: info.messageId,
      };
    } catch (err) {
      this.logger.error(err);
    }
  }
}
