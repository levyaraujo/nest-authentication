import { NestFactory } from '@nestjs/core';
import { EmailModule } from './email.module';
import { RabbitMQService } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(EmailModule);
  const rmqService = app.get<RabbitMQService>(RabbitMQService);
  app.connectMicroservice(rmqService.getOptions('EMAIL'));
  await app.startAllMicroservices();
}
bootstrap();
