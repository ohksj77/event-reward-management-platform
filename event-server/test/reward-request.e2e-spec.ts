import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('RewardRequestController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let eventId: string;
  let rewardId: string;

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
        name: 'Test Event for Reward Request',
        description: 'Test Description',
        type: 'LOGIN',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        conditions: {
          loginStreakDays: 3,
        },
      });

    eventId = eventResponse.body._id;

    // 테스트용 리워드 생성
    const rewardResponse = await request(app.getHttpServer())
      .post('/rewards')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Reward for Request',
        description: 'Test Description',
        type: 'ITEM',
        value: 100,
        eventId: eventId,
      });

    rewardId = rewardResponse.body._id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/reward-requests (POST)', () => {
    it('should create a reward request successfully', () => {
      return request(app.getHttpServer())
        .post('/reward-requests')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventId: eventId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id');
          expect(res.body.eventId).toBe(eventId);
          expect(res.body.status).toBe('PENDING');
        });
    });

    it('should return 409 when duplicate request exists', async () => {
      // 첫 번째 요청 생성
      await request(app.getHttpServer())
        .post('/reward-requests')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventId: eventId,
        });

      // 동일한 이벤트에 대한 중복 요청
      return request(app.getHttpServer())
        .post('/reward-requests')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventId: eventId,
        })
        .expect(409);
    });
  });

  describe('/reward-requests (GET)', () => {
    it('should return an array of reward requests', () => {
      return request(app.getHttpServer())
        .get('/reward-requests')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/reward-requests/:id (GET)', () => {
    let createdRequestId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/reward-requests')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventId: eventId,
        });

      createdRequestId = response.body._id;
    });

    it('should return a reward request by id', () => {
      return request(app.getHttpServer())
        .get(`/reward-requests/${createdRequestId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(createdRequestId);
          expect(res.body.eventId).toBe(eventId);
        });
    });

    it('should return 404 when reward request not found', () => {
      return request(app.getHttpServer())
        .get('/reward-requests/nonexistentid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/reward-requests/my (GET)', () => {
    it('should return reward requests for the current user', () => {
      return request(app.getHttpServer())
        .get('/reward-requests/my')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((request) => {
            expect(request).toHaveProperty('_id');
            expect(request).toHaveProperty('eventId');
            expect(request).toHaveProperty('status');
          });
        });
    });
  });

  describe('/reward-requests/:id/process (POST)', () => {
    let pendingRequestId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/reward-requests')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventId: eventId,
        });

      pendingRequestId = response.body._id;
    });

    it('should process a reward request successfully', () => {
      return request(app.getHttpServer())
        .post(`/reward-requests/${pendingRequestId}/process`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(pendingRequestId);
          expect(res.body.status).toBe('COMPLETED');
        });
    });

    it('should return 404 when trying to process non-existent request', () => {
      return request(app.getHttpServer())
        .post('/reward-requests/nonexistentid/process')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
}); 