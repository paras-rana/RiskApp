import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Frontend dev server origin.
  app.enableCors({
    origin: 'http://localhost:5173',
  });

  await app.listen(3000);
}

void bootstrap();
