import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('GameLogController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let eventId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 로그인하여 인증 토큰 획득
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'test@example.com',
        password: 'password123',
      });

    authToken = loginResponse.body.access_token;

    // 테스트용 이벤트 생성
    const eventResponse = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Event for Game Log',
        description: 'Test Description',
        type: 'LOGIN',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        conditions: {
          loginStreakDays: 3,
        },
      });

    eventId = eventResponse.body._id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/game-logs (POST)', () => {
    it('should create a game log successfully', () => {
      return request(app.getHttpServer())
        .post('/game-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventId: eventId,
          type: 'LOGIN',
          data: {
            loginStreakDays: 3,
          },
          metadata: {
            device: 'mobile',
            platform: 'ios',
          },
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id');
          expect(res.body.eventId).toBe(eventId);
          expect(res.body.type).toBe('LOGIN');
          expect(res.body.data.loginStreakDays).toBe(3);
          expect(res.body.metadata.device).toBe('mobile');
        });
    });

    it('should return 400 when required fields are missing', () => {
      return request(app.getHttpServer())
        .post('/game-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventId: eventId,
          // type과 data가 누락됨
        })
        .expect(400);
    });
  });

  describe('/game-logs (GET)', () => {
    it('should return an array of game logs', () => {
      return request(app.getHttpServer())
        .get('/game-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/game-logs/:id (GET)', () => {
    let createdLogId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/game-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventId: eventId,
          type: 'LOGIN',
          data: {
            loginStreakDays: 3,
          },
          metadata: {
            device: 'mobile',
            platform: 'ios',
          },
        });

      createdLogId = response.body._id;
    });

    it('should return a game log by id', () => {
      return request(app.getHttpServer())
        .get(`/game-logs/${createdLogId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(createdLogId);
          expect(res.body.eventId).toBe(eventId);
          expect(res.body.type).toBe('LOGIN');
        });
    });

    it('should return 404 when game log not found', () => {
      return request(app.getHttpServer())
        .get('/game-logs/nonexistentid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/game-logs/my (GET)', () => {
    it('should return game logs for the current user', () => {
      return request(app.getHttpServer())
        .get('/game-logs/my')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((log) => {
            expect(log).toHaveProperty('_id');
            expect(log).toHaveProperty('eventId');
            expect(log).toHaveProperty('type');
            expect(log).toHaveProperty('data');
          });
        });
    });
  });

  describe('/game-logs/:id (PATCH)', () => {
    let createdLogId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/game-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventId: eventId,
          type: 'LOGIN',
          data: {
            loginStreakDays: 3,
          },
          metadata: {
            device: 'mobile',
            platform: 'ios',
          },
        });

      createdLogId = response.body._id;
    });

    it('should update a game log successfully', () => {
      return request(app.getHttpServer())
        .patch(`/game-logs/${createdLogId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          data: {
            loginStreakDays: 4,
          },
          metadata: {
            device: 'desktop',
            platform: 'web',
          },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(createdLogId);
          expect(res.body.data.loginStreakDays).toBe(4);
          expect(res.body.metadata.device).toBe('desktop');
        });
    });
  });

  describe('/game-logs/:id (DELETE)', () => {
    let createdLogId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/game-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventId: eventId,
          type: 'LOGIN',
          data: {
            loginStreakDays: 3,
          },
          metadata: {
            device: 'mobile',
            platform: 'ios',
          },
        });

      createdLogId = response.body._id;
    });

    it('should delete a game log successfully', () => {
      return request(app.getHttpServer())
        .delete(`/game-logs/${createdLogId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(createdLogId);
        });
    });

    it('should return 404 when trying to delete non-existent log', () => {
      return request(app.getHttpServer())
        .delete('/game-logs/nonexistentid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
}); 