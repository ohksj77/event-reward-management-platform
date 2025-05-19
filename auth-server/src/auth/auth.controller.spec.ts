import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';
import { UserRepository } from '../user/user.repository';
import { TokenRepository } from '../token/token.repository';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../user/user.schema';
import { RefreshToken } from '../token/refresh-token.schema';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AUTH_CONSTANTS } from './auth.constants';
import { UserRole } from '../user/user.schema';
import * as bcrypt from 'bcrypt';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let validationPipe: ValidationPipe;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn().mockResolvedValue({ _id: 'user123' }),
  };

  const mockTokenRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockUserService = {
    create: jest.fn(),
    findByLoginId: jest.fn(),
    validatePassword: jest.fn(),
    findById: jest.fn(),
  };

  const mockTokenService = {
    generateTokens: jest.fn(),
    saveRefreshToken: jest.fn(),
    findValidRefreshToken: jest.fn(),
    invalidateRefreshToken: jest.fn(),
    verifyToken: jest.fn(),
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: TokenRepository,
          useValue: mockTokenRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getModelToken(User.name),
          useValue: {},
        },
        {
          provide: getModelToken(RefreshToken.name),
          useValue: {},
        },
        ValidationPipe,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    validationPipe = module.get<ValidationPipe>(ValidationPipe);
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      loginId: 'testuser',
      password: 'password123',
      nickname: 'Test User',
      role: UserRole.USER,
    };

    it('should register a new user', async () => {
      const mockUser = { _id: 'user123', ...registerDto };
      mockAuthService.register.mockResolvedValue(mockUser);

      const result = await controller.register(registerDto);

      expect(result).toEqual(
        expect.objectContaining({ _id: mockUser._id })
      );
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should throw BadRequestException when loginId is missing', async () => {
      const invalidDto = { ...registerDto, loginId: undefined };
      mockAuthService.register.mockRejectedValue(new BadRequestException());

      await expect(controller.register(invalidDto as RegisterDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when password is too short', async () => {
      const invalidDto = { ...registerDto, password: '123' };
      mockAuthService.register.mockRejectedValue(new BadRequestException());

      await expect(controller.register(invalidDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      loginId: 'testuser',
      password: 'password123',
    };

    it('should return tokens on successful login', async () => {
      const mockResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw BadRequestException when loginId is missing', async () => {
      const invalidDto = { ...loginDto, loginId: undefined };
      mockAuthService.login.mockRejectedValue(new BadRequestException());

      await expect(controller.login(invalidDto as LoginDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when password is missing', async () => {
      const invalidDto = { ...loginDto, password: undefined };
      mockAuthService.login.mockRejectedValue(new BadRequestException());

      await expect(controller.login(invalidDto as LoginDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('refreshToken', () => {
    const refreshTokenDto = {
      refreshToken: 'refresh-token',
    };

    it('should return new tokens on valid refresh token', async () => {
      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockAuthService.refreshToken.mockResolvedValue(mockResponse);

      const result = await controller.refreshToken(refreshTokenDto);

      expect(result).toEqual(mockResponse);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(refreshTokenDto);
    });
  });

  describe('logout', () => {
    const refreshTokenDto = {
      refreshToken: 'refresh-token',
    };

    it('should invalidate refresh token on logout', async () => {
      const mockResponse = { message: AUTH_CONSTANTS.SUCCESS_MESSAGES.LOGOUT };

      mockAuthService.logout.mockResolvedValue(mockResponse);

      const result = await controller.logout(refreshTokenDto);

      expect(result).toEqual(mockResponse);
      expect(mockAuthService.logout).toHaveBeenCalledWith(refreshTokenDto);
    });
  });
});
