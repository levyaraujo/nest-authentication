import { Controller } from '@nestjs/common';
import { EmailService } from './email.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { incomingMessageDto } from './dto/message.dto';

@Controller()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @EventPattern('user-created')
  async handleUserSendEmail(@Payload() data: incomingMessageDto) {
    return this.emailService.sendEmail(data);
  }
}
