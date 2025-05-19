import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { EventRepository } from './event.repository';
import { NotFoundException } from '@nestjs/common';
import { Event, EventType } from './event.schema';
import { Types } from 'mongoose';

describe('EventService', () => {
  let service: EventService;
  let repository: EventRepository;

  const mockEventRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: EventRepository,
          useValue: mockEventRepository,
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    repository = module.get<EventRepository>(EventRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createEventDto = {
      name: 'Test Event',
      type: EventType.HUNT,
      requiredCount: 3,
      metadata: { monsterId: 'monster123' },
      endDate: new Date(),
    };

    it('should create an event successfully', async () => {
      const mockEvent = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439011').toString(),
        ...createEventDto,
      } as unknown as Event;

      mockEventRepository.create.mockResolvedValue(mockEvent);

      const result = await service.create(createEventDto);

      expect(repository.create).toHaveBeenCalledWith({
        ...createEventDto,
      });
      expect(result).toEqual(mockEvent);
    });
  });

  describe('findAll', () => {
    it('should return an array of events', async () => {
      const mockEvents = [
        {
          _id: new Types.ObjectId('507f1f77bcf86cd799439011').toString(),
          name: 'Event 1',
          type: EventType.HUNT,
          requiredCount: 3,
          metadata: { monsterId: 'monster123' },
          endDate: new Date(),
        },
        {
          _id: new Types.ObjectId('507f1f77bcf86cd799439012').toString(),
          name: 'Event 2',
          type: EventType.INVITE,
          requiredCount: 2,
          metadata: { inviteCode: 'INVITE123' },
          endDate: new Date(),
        },
      ] as unknown as Event[];

      mockEventRepository.findAll.mockResolvedValue(mockEvents);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockEvents);
    });
  });

  describe('findOne', () => {
    it('should return an event by id', async () => {
      const mockEvent = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439011').toString(),
        name: 'Test Event',
        type: EventType.STREAK,
        userId: '507f1f77bcf86cd799439011',
        requiredCount: 7,
        metadata: {},
        endDate: new Date(),
      } as unknown as Event;

      mockEventRepository.findById.mockResolvedValue(mockEvent);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(repository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toMatchObject({
        _id: mockEvent._id,
        name: mockEvent.name,
        type: mockEvent.type,
        requiredCount: mockEvent.requiredCount,
        metadata: mockEvent.metadata,
        endDate: mockEvent.endDate,
      });
    });

    it('should throw NotFoundException when event not found', async () => {
      mockEventRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(NotFoundException);
    });

    it('should return the raw event entity with findOneEntity', async () => {
      const mockEvent = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
        name: 'Test Event',
        type: EventType.HUNT,
        userId: '507f1f77bcf86cd799439011',
        requiredCount: 5,
        metadata: {},
        endDate: new Date(),
      } as unknown as Event;

      mockEventRepository.findById.mockResolvedValue(mockEvent);

      const result = await service.findOneEntity('507f1f77bcf86cd799439011');

      expect(repository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toBe(mockEvent);
    });

    it('should throw NotFoundException in findOneEntity when event not found', async () => {
      mockEventRepository.findById.mockResolvedValue(null);

      await expect(service.findOneEntity('507f1f77bcf86cd799439011')).rejects.toThrow(NotFoundException);
    });
  });

  describe('EventService edge cases', () => {
    it('should call findAll with default pagination', async () => {
      mockEventRepository.findAll.mockResolvedValue([]);
      await service.findAll();
      expect(repository.findAll).toHaveBeenCalled();
    });

    it('should create event with minimal required fields', async () => {
      const createEventDto = {
        name: 'Minimal Event',
        type: EventType.HUNT,
        requiredCount: 1,
        metadata: {},
        endDate: new Date(),
      };
      const mockEvent = {
        _id: new Types.ObjectId(),
        ...createEventDto,
      } as unknown as Event;
      mockEventRepository.create.mockResolvedValue(mockEvent);

      const result = await service.create(createEventDto);

      expect(repository.create).toHaveBeenCalled();
      expect(result).toMatchObject({
        name: createEventDto.name,
        type: createEventDto.type,
        requiredCount: createEventDto.requiredCount,
        metadata: createEventDto.metadata,
      });
    });
  });
});
