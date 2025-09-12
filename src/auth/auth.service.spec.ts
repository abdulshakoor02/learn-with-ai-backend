import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

// Mock bcrypt since it's used in validateUser
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

const mockUsersService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      const mockUser = {
        _id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (require('bcrypt').compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toEqual({
        _id: '1',
        email: 'test@example.com',
        name: 'Test User',
      });
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(require('bcrypt').compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword',
      );
    });

    it('should return null when user is not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'nonexistent@example.com',
        'password123',
      );

      expect(result).toBeNull();
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'nonexistent@example.com',
      );
      expect(require('bcrypt').compare).not.toHaveBeenCalled();
    });

    it('should return null when password is invalid', async () => {
      const mockUser = {
        _id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (require('bcrypt').compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(require('bcrypt').compare).toHaveBeenCalledWith(
        'wrongpassword',
        'hashedPassword',
      );
    });

    it('should handle bcrypt comparison errors', async () => {
      const mockUser = {
        _id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (require('bcrypt').compare as jest.Mock).mockRejectedValue(
        new Error('BCrypt error'),
      );

      await expect(
        service.validateUser('test@example.com', 'password123'),
      ).rejects.toThrow('BCrypt error');
    });

    it('should handle user service errors', async () => {
      mockUsersService.findByEmail.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.validateUser('test@example.com', 'password123'),
      ).rejects.toThrow('Database error');
    });
  });

  describe('login', () => {
    it('should generate JWT token with correct payload', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(mockUser);

      expect(result).toEqual({ access_token: 'jwt-token' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: 'test@example.com',
        sub: 'user123',
        name: 'Test User',
      });
    });

    it('should handle JWT signing errors', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockJwtService.sign.mockImplementation(() => {
        throw new Error('JWT signing error');
      });

      await expect(service.login(mockUser)).rejects.toThrow(
        'JWT signing error',
      );
    });
  });

  describe('validateToken', () => {
    it('should return decoded token for valid token', async () => {
      const mockDecoded = { email: 'test@example.com', sub: 'user123' };
      mockJwtService.verify.mockReturnValue(mockDecoded);

      const result = await service.validateToken('valid-token');

      expect(result).toEqual(mockDecoded);
      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-token');
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.validateToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateToken('invalid-token')).rejects.toThrow(
        'Invalid token',
      );
    });

    it('should handle various JWT verification errors', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      await expect(service.validateToken('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateToken('expired-token')).rejects.toThrow(
        'Invalid token',
      );
    });
  });
});
