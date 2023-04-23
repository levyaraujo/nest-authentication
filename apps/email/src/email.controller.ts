import { Controller } from '@nestjs/common';
import { EmailService } from './email.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { rmqMessageDto } from './dto/message.dto';

@Controller()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @EventPattern('user-created')
  async handleUserSendEmail(
    @Payload() data: rmqMessageDto,
    @Ctx() context: RmqContext,
  ) {
    console.log('data', data);
    this.emailService.sendEmail(data);
  }
}
