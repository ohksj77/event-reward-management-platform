import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { EventStatus } from '../src/event/event.schema';
import { GameLogType } from '../src/game-log/game-log.schema';
import { EVENT_ERROR_MESSAGES, EVENT_DEFAULTS } from '../src/event/event.constants';

describe('EventController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 로그인하여 토큰 획득
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginId: 'test@example.com',
        password: 'password123',
      });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/events (POST)', () => {
    const createEventDto = {
      name: 'Test Event',
      description: 'Test Description',
      type: GameLogType.LOGIN,
      condition: { value: 3 },
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    it('should create an event', () => {
      return request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createEventDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id');
          expect(res.body.name).toBe(createEventDto.name);
          expect(res.body.description).toBe(createEventDto.description);
          expect(res.body.type).toBe(createEventDto.type);
          expect(res.body.status).toBe(EventStatus.ACTIVE);
        });
    });

    it('should return 400 when login streak exceeds max days', () => {
      const invalidDto = {
        ...createEventDto,
        condition: { value: EVENT_DEFAULTS.MAX_LOGIN_STREAK_DAYS + 1 },
      };

      return request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe(
            `${EVENT_ERROR_MESSAGES.LOGIN_STREAK_EXCEEDED} ${EVENT_DEFAULTS.MAX_LOGIN_STREAK_DAYS}`,
          );
        });
    });

    it('should return 400 when hunt event has no monsterId', () => {
      const invalidDto = {
        ...createEventDto,
        type: GameLogType.HUNT,
        condition: { value: 1 },
      };

      return request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe(EVENT_ERROR_MESSAGES.MONSTER_ID_REQUIRED);
        });
    });
  });

  describe('/events (GET)', () => {
    it('should return an array of events', () => {
      return request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('_id');
            expect(res.body[0]).toHaveProperty('name');
            expect(res.body[0]).toHaveProperty('description');
            expect(res.body[0]).toHaveProperty('type');
            expect(res.body[0]).toHaveProperty('status');
          }
        });
    });
  });

  describe('/events/:id (GET)', () => {
    let eventId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${authToken}`);
      eventId = response.body[0]._id;
    });

    it('should return an event by id', () => {
      return request(app.getHttpServer())
        .get(`/events/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id', eventId);
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('description');
          expect(res.body).toHaveProperty('type');
          expect(res.body).toHaveProperty('status');
        });
    });

    it('should return 404 when event not found', () => {
      return request(app.getHttpServer())
        .get('/events/nonexistentid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe(EVENT_ERROR_MESSAGES.NOT_FOUND);
        });
    });
  });

  describe('/events/:id (PATCH)', () => {
    let eventId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${authToken}`);
      eventId = response.body[0]._id;
    });

    it('should update an event', () => {
      const updateEventDto = {
        name: 'Updated Event Name',
        description: 'Updated Description',
      };

      return request(app.getHttpServer())
        .patch(`/events/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateEventDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id', eventId);
          expect(res.body.name).toBe(updateEventDto.name);
          expect(res.body.description).toBe(updateEventDto.description);
        });
    });
  });

  describe('/events/:id/status (PATCH)', () => {
    let eventId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${authToken}`);
      eventId = response.body[0]._id;
    });

    it('should update event status', () => {
      return request(app.getHttpServer())
        .patch(`/events/${eventId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: EventStatus.INACTIVE })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id', eventId);
          expect(res.body.status).toBe(EventStatus.INACTIVE);
        });
    });
  });

  describe('/events/:id (DELETE)', () => {
    let eventId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .set('Authorization', `Bearer ${authToken}`);
      eventId = response.body[0]._id;
    });

    it('should delete an event', () => {
      return request(app.getHttpServer())
        .delete(`/events/${eventId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id', eventId);
        });
    });
  });
}); 