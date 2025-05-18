import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let dbConnection: Connection;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    process.env.MONGODB_URI = uri;
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    
    await app.init();
    
    dbConnection = moduleFixture.get<Connection>(getConnectionToken());
  }, 60000);

  afterEach(async () => {
    if (dbConnection) {
      const collections = dbConnection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
    }
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (mongod) {
      await mongod.stop();
    }
  }, 60000);

  describe('POST /auth/register', () => {
    const registerDto = {
      loginId: 'testuser',
      password: 'password123',
      nickname: 'Test User',
    };

    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id');
        });
    });

    it('should fail when loginId is missing', () => {
      const invalidDto = {
        password: 'password123',
        nickname: 'Test User',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidDto)
        .expect(400);
    });

    it('should fail when password is too short', () => {
      const invalidDto = {
        ...registerDto,
        password: '123',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidDto)
        .expect(400);
    });

    it('should fail when trying to register with existing loginId', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    const registerDto = {
      loginId: 'testuser',
      password: 'password123',
      nickname: 'Test User',
    };

    const loginDto = {
      loginId: 'testuser',
      password: 'password123',
    };

    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);
    });

    it('should login successfully and return tokens', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });

    it('should fail with incorrect password', () => {
      const invalidDto = {
        ...loginDto,
        password: 'wrongpassword',
      };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidDto)
        .expect(401);
    });

    it('should fail with non-existent loginId', () => {
      const invalidDto = {
        ...loginDto,
        loginId: 'nonexistent',
      };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidDto)
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    const registerDto = {
      loginId: 'testuser',
      password: 'password123',
      nickname: 'Test User',
    };

    let refreshToken: string;

    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginId: registerDto.loginId,
          password: registerDto.password,
        })
        .expect(200);

      refreshToken = loginResponse.body.refreshToken;
    });

    it('should refresh tokens successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.refreshToken).not.toBe(refreshToken);
        });
    });

    it('should fail with invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    const registerDto = {
      loginId: 'testuser',
      password: 'password123',
      nickname: 'Test User',
    };

    let refreshToken: string;

    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginId: registerDto.loginId,
          password: registerDto.password,
        })
        .expect(200);

      refreshToken = loginResponse.body.refreshToken;
    });

    it('should logout successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .send({ refreshToken })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({ message: '로그아웃되었습니다.' });
        });
    });

    it('should fail with invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });

    it('should prevent using the same refresh token after logout', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .send({ refreshToken })
        .expect(200);

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });
  });
});
