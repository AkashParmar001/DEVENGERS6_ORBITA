import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  const corsOrigins = configService.get<string>(
    'CORS_ORIGIN',
    'http://localhost:3000',
  );
  const origins = corsOrigins.split(',').map((o) => o.trim());

  app.use(helmet());
  app.enableCors({
    origin: origins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
  });

  app.use(new RequestIdMiddleware().use);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('ORBITA API')
    .setDescription(
      'ORBITA — Autonomous Intelligence for Space Infrastructure\n\n' +
        '## Authentication\n' +
        'This API uses an API key passed via the `X-Api-Key` header. ' +
        'If no `API_KEY` is configured on the server, all requests are allowed.\n\n' +
        '## Realtime\n' +
        'Subscribe to Supabase Realtime channels for live updates:\n' +
        '- `mission.*` — Mission lifecycle events\n' +
        '- `robot.telemetry.updated` — Robot telemetry updates\n' +
        '- `object.position.updated` — Orbital state updates\n' +
        '- `anomaly.detected` — Anomaly detection events\n' +
        '- `risk.updated` — Risk assessment updates\n\n' +
        '## Response Format\n' +
        'All responses follow a consistent format:\n' +
        '- Single object: `{ "data": {} }`\n' +
        '- List: `{ "data": [], "meta": { "page", "limit", "total", "totalPages" } }`\n' +
        '- Error: `{ "error": { "code", "message", "details", "requestId", "timestamp", "path" } }`',
    )
    .setVersion('0.1.0')
    .addApiKey({ type: 'apiKey', name: 'X-Api-Key', in: 'header' }, 'api-key')
    .addTag('Health', 'Health and readiness checks')
    .addTag('Auth', 'Authentication operations')
    .addTag('Users', 'User management')
    .addTag('Missions', 'Mission management with strict state machine')
    .addTag(
      'Space Objects',
      'Space object tracking (satellites, debris, robots, spacecraft)',
    )
    .addTag('Satellites', 'Satellite-specific operations')
    .addTag('Robots', 'Robot-specific operations')
    .addTag('Telemetry', 'Telemetry data queries')
    .addTag('Mission Events', 'Mission event history')
    .addTag('Reports', 'Mission reports and analysis')
    .addTag('Realtime', 'Supabase Realtime subscription info')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    },
  });

  await app.listen(port);
  logger.log(`ORBITA Backend running on: http://localhost:${port}`);
  logger.log(`API Docs: http://localhost:${port}/api/docs`);
  logger.log(`Environment: ${nodeEnv}`);
}
bootstrap();
