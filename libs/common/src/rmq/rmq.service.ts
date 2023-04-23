import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, RmqOptions, Transport } from '@nestjs/microservices';
import { EMAIL_SERVICE } from './constants/services';
import { rmqDto } from 'apps/users/src/dto/rabbitmq-user.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class RabbitMQService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(EMAIL_SERVICE) private emailClient: ClientProxy,
  ) {}

  getOptions(queue: string, noAck = false): RmqOptions {
    return {
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get<string>('RABBITMQ_URI') ?? ''],
        queue: this.configService.get<string>(`RABBITMQ_${queue}_QUEUE`),
        noAck,
        persistent: true,
      },
    };
  }

  async sendRabbitMQMessage(email: string, firstName: string): Promise<void> {
    const message: rmqDto = {
      userEmail: email,
      firstName: firstName,
    };
    await lastValueFrom(this.emailClient.emit('user-created', message));
  }
}
