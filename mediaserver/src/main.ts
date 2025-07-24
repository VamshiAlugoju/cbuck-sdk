require('dotenv').config();
import { NestFactory } from '@nestjs/core';
import { MediaserverModule } from './mediaserver.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggingInterceptor } from './Loggerinterceptor';

async function bootstrap() {
  const app = await NestFactory.create(MediaserverModule);

  app.enableShutdownHooks();
  app.useGlobalInterceptors(new LoggingInterceptor());
  // Swagger Config
  const config = new DocumentBuilder()
    .setTitle('Media server Api')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'accessToken',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'swagger/swagger.json',
  });
  await app.listen(process.env.PORT ?? 8085);
}

bootstrap();
