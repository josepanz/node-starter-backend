import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import * as path from 'path';
import * as fs from 'fs';
import * as cookieParser from 'cookie-parser';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { AppModule } from './app.module';
import { ObservabilityInterceptor } from '@core/observability/observability.interceptor';
import { AllExceptionsFilter } from '@core/global-filters/http-exception.filter';
import * as express from 'express';
import { join } from 'path';

interface PackageJson {
  version: string;
  [key: string]: unknown;
}

const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8'),
) as PackageJson;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useLogger(app.get(Logger));

  app.useGlobalInterceptors(app.get(ObservabilityInterceptor));
  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      validationError: { target: false },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors({ origin: true, credentials: true });

  app.enableVersioning();
  app.setGlobalPrefix('/node-starter-backend/api');

  const config: ConfigType<AppConfigType> = app.get(APP_CONFIG.KEY);

  const swaggerConfig = new DocumentBuilder()
    .setTitle(config.project.name)
    .setDescription(config.project.description)
    .setVersion(packageJson.version)
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`/node-starter-backend/api/swagger`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // 1. Definir la ruta donde se espera la carpeta 'docs'
  // En producción (dist/main.js), esta ruta apunta a 'dist/docs'
  const docsPath = join(__dirname, '..', 'docs');

  // 2. Verificar si la carpeta de documentación existe
  if (fs.existsSync(docsPath)) {
    // Si existe, configuramos el middleware para servirla
    app.use('/node-starter-backend/api/docs', express.static(docsPath));
    console.log(
      `✅ Documentación de Compodoc servida en /node-starter-backend/api/docs`,
    );
  } else {
    // Si no existe, solo mostramos un aviso y continuamos
    console.warn(
      `⚠️ Directorio de docs no encontrado en ${docsPath}. La documentación de Compodoc no se servirá.`,
    );
  }

  await app.listen(config.apiconfig.port);
}

void bootstrap();
