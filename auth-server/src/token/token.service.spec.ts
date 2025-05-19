import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { JwtService } from '@nestjs/jwt';
import { TokenRepository } from './token.repository';
import { User } from '../user/user.schema';

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: JwtService;
  let tokenRepository: TokenRepository;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockTokenRepository = {
    create: jest.fn(),
    findOne: jest.fn(),
    updateOne: jest.fn(),
  };

  const mockUser: Partial<User> = {
    _id: 'user123',
    loginId: 'testuser',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: TokenRepository, useValue: mockTokenRepository },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get<JwtService>(JwtService);
    tokenRepository = module.get<TokenRepository>(TokenRepository);

    jest.clearAllMocks();
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      mockJwtService.sign
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      const result = service.generateTokens(mockUser as User);

      expect(result).toEqual({
        accessToken,
        refreshToken,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser._id,
          loginId: mockUser.loginId,
        }),
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser._id,
          loginId: mockUser.loginId,
        }),
        expect.objectContaining({ expiresIn: expect.any(String) }),
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify token and return payload', () => {
      const token = 'test-token';
      const payload = { sub: 'user123', loginId: 'testuser' };

      mockJwtService.verify.mockReturnValue(payload);

      const result = service.verifyToken(token);

      expect(result).toEqual(payload);
      expect(mockJwtService.verify).toHaveBeenCalledWith(token);
    });
  });

  describe('saveRefreshToken', () => {
    it('should save refresh token with expiration', async () => {
      const userId = 'user123';
      const token = 'refresh-token';
      const mockToken = { _id: 'token123', userId, value: token };

      mockTokenRepository.create.mockResolvedValue(mockToken);

      const result = await service.saveRefreshToken(userId, token);

      expect(result).toEqual(mockToken);
      expect(mockTokenRepository.create).toHaveBeenCalledWith({
        userId,
        value: token,
        expiresAt: expect.any(Date),
      });
    });
  });

  describe('findValidRefreshToken', () => {
    it('should find valid refresh token', async () => {
      const token = 'refresh-token';
      const userId = 'user123';
      const mockToken = { _id: 'token123', userId, value: token };

      mockTokenRepository.findOne.mockResolvedValue(mockToken);

      const result = await service.findValidRefreshToken(token, userId);

      expect(result).toEqual(mockToken);
      expect(mockTokenRepository.findOne).toHaveBeenCalledWith({
        value: token,
        userId,
        deletedAt: null,
      });
    });

    it('should return null when token not found', async () => {
      const token = 'invalid-token';
      const userId = 'user123';

      mockTokenRepository.findOne.mockResolvedValue(null);

      const result = await service.findValidRefreshToken(token, userId);

      expect(result).toBeNull();
      expect(mockTokenRepository.findOne).toHaveBeenCalledWith({
        value: token,
        userId,
        deletedAt: null,
      });
    });
  });

  describe('invalidateRefreshToken', () => {
    it('should invalidate refresh token', async () => {
      const tokenId = 'token123';
      const mockToken = { _id: tokenId, deletedAt: new Date() };

      mockTokenRepository.updateOne.mockResolvedValue(mockToken);

      const result = await service.invalidateRefreshToken(tokenId);

      expect(result).toEqual(mockToken);
      expect(mockTokenRepository.updateOne).toHaveBeenCalledWith(
        { _id: tokenId },
        { $set: { deletedAt: expect.any(Date) } }
      );
    });
  });
});
