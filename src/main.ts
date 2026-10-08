// In server/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- CONFIGURATION CHANGES ---

  // 1. Set global API prefix
  app.setGlobalPrefix('api');

  // 2. Enable CORS
  // This allows your Next.js frontend (running on a different port)
  // to make requests to this backend.
  app.enableCors({
    origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 2. Change the port from 3000 to 8000
  const port = process.env.PORT || 8000;
  await app.listen(port);

  console.log(`NestJS application is running on: http://localhost:${port}`);
}
bootstrap();
