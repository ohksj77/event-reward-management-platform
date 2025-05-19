import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { RewardType } from '../src/reward/reward.schema';

describe('RewardController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/rewards (POST)', () => {
    it('should create a reward successfully', () => {
      return request(app.getHttpServer())
        .post('/rewards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Reward',
          description: 'Test Description',
          type: RewardType.ITEM,
          value: 100,
          eventId: 'event123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id');
          expect(res.body.name).toBe('Test Reward');
          expect(res.body.type).toBe(RewardType.ITEM);
        });
    });

    it('should return 400 when required fields are missing', () => {
      return request(app.getHttpServer())
        .post('/rewards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Reward',
          // type과 value가 누락됨
        })
        .expect(400);
    });
  });

  describe('/rewards (GET)', () => {
    it('should return an array of rewards', () => {
      return request(app.getHttpServer())
        .get('/rewards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/rewards/:id (GET)', () => {
    let createdRewardId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/rewards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Reward for Get',
          description: 'Test Description',
          type: RewardType.ITEM,
          value: 100,
          eventId: 'event123',
        });

      createdRewardId = response.body._id;
    });

    it('should return a reward by id', () => {
      return request(app.getHttpServer())
        .get(`/rewards/${createdRewardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(createdRewardId);
          expect(res.body.name).toBe('Test Reward for Get');
        });
    });

    it('should return 404 when reward not found', () => {
      return request(app.getHttpServer())
        .get('/rewards/nonexistentid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/rewards/:id (PATCH)', () => {
    let createdRewardId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/rewards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Reward for Update',
          description: 'Test Description',
          type: RewardType.ITEM,
          value: 100,
          eventId: 'event123',
        });

      createdRewardId = response.body._id;
    });

    it('should update a reward successfully', () => {
      return request(app.getHttpServer())
        .patch(`/rewards/${createdRewardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Reward',
          description: 'Updated Description',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(createdRewardId);
          expect(res.body.name).toBe('Updated Reward');
          expect(res.body.description).toBe('Updated Description');
        });
    });
  });

  describe('/rewards/:id (DELETE)', () => {
    let createdRewardId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/rewards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Reward for Delete',
          description: 'Test Description',
          type: RewardType.ITEM,
          value: 100,
          eventId: 'event123',
        });

      createdRewardId = response.body._id;
    });

    it('should delete a reward successfully', () => {
      return request(app.getHttpServer())
        .delete(`/rewards/${createdRewardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(createdRewardId);
        });
    });

    it('should return 404 when trying to delete non-existent reward', () => {
      return request(app.getHttpServer())
        .delete('/rewards/nonexistentid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/rewards/event/:eventId (GET)', () => {
    let eventId: string;

    beforeAll(async () => {
      // 이벤트 생성
      const eventResponse = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Event for Rewards',
          description: 'Test Description',
          type: 'LOGIN',
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          conditions: {
            loginStreakDays: 3,
          },
        });

      eventId = eventResponse.body._id;

      // 해당 이벤트에 대한 리워드 생성
      await request(app.getHttpServer())
        .post('/rewards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Reward for Event',
          description: 'Test Description',
          type: RewardType.ITEM,
          value: 100,
          eventId: eventId,
        });
    });

    it('should return rewards for a specific event', () => {
      return request(app.getHttpServer())
        .get(`/rewards/event/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0].eventId).toBe(eventId);
        });
    });

    it('should return empty array for non-existent event', () => {
      return request(app.getHttpServer())
        .get('/rewards/event/nonexistentid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(0);
        });
    });
  });
}); 