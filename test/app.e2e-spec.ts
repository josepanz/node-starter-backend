/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import request = require('supertest');
import { App } from 'supertest/types';
import cookieParser from 'cookie-parser';
import { MemoryHealthIndicator, PrismaHealthIndicator } from '@nestjs/terminus';
import { AppModule } from './../src/app.module';
import { PrismaDatasource } from './../src/core/database/services/prisma.service';

const mockPingCheck = jest
  .fn()
  .mockResolvedValue({ database: { status: 'up' } });

const mockPrisma = {
  $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  isConnected: true,
  extended: {},
};

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaDatasource)
      .useValue(mockPrisma)
      .overrideProvider(PrismaHealthIndicator)
      .useValue({ pingCheck: mockPingCheck })
      .overrideProvider(MemoryHealthIndicator)
      .useValue({
        checkHeap: jest
          .fn()
          .mockResolvedValue({ memory_heap: { status: 'up' } }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        validationError: { target: false },
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.enableVersioning({ type: VersioningType.URI });
    app.setGlobalPrefix('/node-starter-backend/api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => jest.clearAllMocks());

  it('/node-starter-backend/api/v1/healthcheck (GET)', () => {
    return request(app.getHttpServer())
      .get('/node-starter-backend/api/v1/healthcheck')
      .expect(200);
  });
});
