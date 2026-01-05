import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for web dashboard
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('ScaleFit API')
    .setDescription('High-scale digital fitness coaching platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('workouts', 'Workout plans and exercises')
    .addTag('nutrition', 'Nutrition plans and tracking')
    .addTag('check-ins', 'Athlete check-ins')
    .addTag('alerts', 'Smart coach alerts')
    .addTag('chat', 'Real-time messaging')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  
  console.log(`
🏋️ ScaleFit API is running!
📍 Server: http://localhost:${port}
📚 API Docs: http://localhost:${port}/api/docs
  `);
}

bootstrap();

