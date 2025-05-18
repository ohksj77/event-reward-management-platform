import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AUTH_CONSTANTS } from './auth.constants';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let tokenService: TokenService;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    tokenService = module.get<TokenService>(TokenService);
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      loginId: 'testuser',
      password: 'password123',
      nickname: 'Test User',
    };

    it('should register a new user successfully', async () => {
      const mockUser = { _id: 'user123', ...registerDto };
      mockUserService.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result).toEqual(mockUser);
      expect(mockUserService.create).toHaveBeenCalledWith(registerDto);
    });

    it('should throw ConflictException when loginId already exists', async () => {
      mockUserService.create.mockRejectedValue(new ConflictException());

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      loginId: 'testuser',
      password: 'password123',
    };

    it('should login successfully and return tokens', async () => {
      const mockUser = { _id: 'user123', ...loginDto };
      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockUserService.findByLoginId.mockResolvedValue(mockUser);
      mockUserService.validatePassword.mockResolvedValue(true);
      mockTokenService.generateTokens.mockReturnValue(mockTokens);
      mockTokenService.saveRefreshToken.mockResolvedValue({ _id: 'token123' });

      const result = await service.login(loginDto);

      expect(result).toEqual(mockTokens);
      expect(mockUserService.findByLoginId).toHaveBeenCalledWith(loginDto.loginId);
      expect(mockUserService.validatePassword).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(mockTokenService.generateTokens).toHaveBeenCalledWith(mockUser);
      expect(mockTokenService.saveRefreshToken).toHaveBeenCalledWith(
        mockUser._id.toString(),
        mockTokens.refreshToken,
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserService.findByLoginId.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const mockUser = { _id: 'user123', ...loginDto };
      mockUserService.findByLoginId.mockResolvedValue(mockUser);
      mockUserService.validatePassword.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    const refreshToken = 'refresh-token';
    const userId = 'user123';

    it('should refresh tokens successfully', async () => {
      const mockUser = { _id: userId, loginId: 'testuser' };
      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };
      const mockToken = { _id: 'token123', userId, value: refreshToken };

      mockTokenService.verifyToken.mockReturnValue({ sub: userId });
      mockTokenService.findValidRefreshToken.mockResolvedValue(mockToken);
      mockUserService.findById.mockResolvedValue(mockUser);
      mockTokenService.generateTokens.mockReturnValue(mockTokens);
      mockTokenService.saveRefreshToken.mockResolvedValue({ _id: 'new-token123' });

      const result = await service.refreshToken({ refreshToken });

      expect(result).toEqual(mockTokens);
      expect(mockTokenService.verifyToken).toHaveBeenCalledWith(refreshToken);
      expect(mockTokenService.findValidRefreshToken).toHaveBeenCalledWith(refreshToken, userId);
      expect(mockUserService.findById).toHaveBeenCalledWith(userId);
      expect(mockTokenService.generateTokens).toHaveBeenCalledWith(mockUser);
      expect(mockTokenService.saveRefreshToken).toHaveBeenCalledWith(
        userId,
        mockTokens.refreshToken,
      );
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      mockTokenService.verifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken({ refreshToken })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    const refreshToken = 'refresh-token';
    const userId = 'user123';

    it('should logout successfully', async () => {
      const mockToken = { _id: 'token123', userId, value: refreshToken };

      mockTokenService.verifyToken.mockReturnValue({ sub: userId });
      mockTokenService.findValidRefreshToken.mockResolvedValue(mockToken);
      mockTokenService.invalidateRefreshToken.mockResolvedValue({ ...mockToken, deletedAt: new Date() });

      const result = await service.logout({ refreshToken });

      expect(result).toEqual({ message: AUTH_CONSTANTS.SUCCESS_MESSAGES.LOGOUT });
      expect(mockTokenService.verifyToken).toHaveBeenCalledWith(refreshToken);
      expect(mockTokenService.findValidRefreshToken).toHaveBeenCalledWith(refreshToken, userId);
      expect(mockTokenService.invalidateRefreshToken).toHaveBeenCalledWith(mockToken._id.toString());
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      mockTokenService.verifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.logout({ refreshToken })).rejects.toThrow(UnauthorizedException);
    });
  });
});
