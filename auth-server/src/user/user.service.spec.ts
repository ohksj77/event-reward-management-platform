import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { UserRole } from './user.schema';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;

  const mockUserRepository = {
    create: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
  });

  describe('create', () => {
    const hashedPassword = 'hashedPassword123';
    const registerDto = {
      loginId: 'testuser',
      password: 'password123',
      nickname: 'nickname',
      role: UserRole.USER
    };
    const mockUser = { _id: 'user123', ...registerDto, password: hashedPassword };

    it('should create a new user with hashed password', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await service.create(registerDto);

      expect(result).toEqual(mockUser);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...registerDto,
        password: hashedPassword,
      });
    });
  });

  describe('findByLoginId', () => {
    it('should find user by loginId', async () => {
      const loginId = 'testuser';
      const mockUser = { _id: 'user123', loginId };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByLoginId(loginId);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ loginId });
    });

    it('should return null when user not found', async () => {
      const loginId = 'nonexistent';

      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findByLoginId(loginId);

      expect(result).toBeNull();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ loginId });
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const userId = 'user123';
      const mockUser = { _id: userId, loginId: 'testuser' };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findById(userId);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should return null when user not found', async () => {
      const userId = 'nonexistent';

      mockUserRepository.findById.mockResolvedValue(null);

      const result = await service.findById(userId);

      expect(result).toBeNull();
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      
      const plainPassword = 'wrongpassword';
      const hashedPassword = 'hashedPassword123';
      const result = await service.validatePassword(plainPassword, hashedPassword);

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
    });

    it('should return false for invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const plainPassword = 'wrongpassword';
      const hashedPassword = 'hashedPassword123';

      const result = await service.validatePassword(plainPassword, hashedPassword);

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
    });
  });
});
