import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  // Enable Zod Validation Globally
  app.useGlobalPipes(new ZodValidationPipe());

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Nestject API')
    .setDescription('The Nestject API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Run on port 3001 to avoid conflict with Frontend (3000)
  await app.listen(process.env.PORT ?? 3001);
  const logger = app.get(Logger);
  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log(`Swagger is running on: ${await app.getUrl()}/api`);
}
void bootstrap();
