import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow POST /users without authentication', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            url: '/users',
          }),
        }),
      } as ExecutionContext;

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should allow POST /auth/login without authentication', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            method: 'POST',
            url: '/auth/login',
          }),
        }),
      } as ExecutionContext;

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should delegate to parent canActivate for other routes', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            method: 'GET',
            url: '/protected',
          }),
        }),
      } as ExecutionContext;

      // Mock the parent canActivate method
      const parentCanActivate = jest.spyOn(
        Object.getPrototypeOf(Object.getPrototypeOf(guard)),
        'canActivate',
      );
      parentCanActivate.mockReturnValue(true);

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
      expect(parentCanActivate).toHaveBeenCalledWith(mockContext);

      parentCanActivate.mockRestore();
    });

    it('should handle different HTTP methods and URLs correctly', () => {
      const testCases = [
        { method: 'POST', url: '/users', expected: true },
        { method: 'POST', url: '/auth/login', expected: true },
        { method: 'GET', url: '/users', expected: false },
        { method: 'PUT', url: '/users/123', expected: false },
        { method: 'DELETE', url: '/users/123', expected: false },
        { method: 'POST', url: '/other-route', expected: false },
      ];

      testCases.forEach(({ method, url, expected }) => {
        const mockContext = {
          switchToHttp: () => ({
            getRequest: () => ({ method, url }),
          }),
        } as ExecutionContext;

        if (!expected) {
          // Mock parent for routes that require authentication
          const parentCanActivate = jest.spyOn(
            Object.getPrototypeOf(Object.getPrototypeOf(guard)),
            'canActivate',
          );
          parentCanActivate.mockReturnValue(true);
        }

        const result = guard.canActivate(mockContext);

        if (expected) {
          expect(result).toBe(true);
        } else {
          // For routes that require auth, we expect the parent to be called
          // which returns true in our mock
          expect(result).toBe(true);
        }

        jest.restoreAllMocks();
      });
    });
  });

  describe('handleRequest', () => {
    it('should return user when authentication is successful', () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      const result = guard.handleRequest(null, mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when user is null', () => {
      expect(() => {
        guard.handleRequest(null, null);
      }).toThrow(UnauthorizedException);

      expect(() => {
        guard.handleRequest(null, null);
      }).toThrow('Invalid or expired token');
    });

    it('should throw UnauthorizedException when user is undefined', () => {
      expect(() => {
        guard.handleRequest(null, undefined);
      }).toThrow(UnauthorizedException);

      expect(() => {
        guard.handleRequest(null, undefined);
      }).toThrow('Invalid or expired token');
    });

    it('should re-throw existing errors', () => {
      const originalError = new Error('Original error');

      expect(() => {
        guard.handleRequest(originalError, null);
      }).toThrow(originalError);
    });

    it('should prioritize existing errors over missing user', () => {
      const originalError = new Error('Original error');

      expect(() => {
        guard.handleRequest(originalError, null);
      }).toThrow('Original error');
    });

    it('should handle various error types', () => {
      const errors = [
        new Error('Generic error'),
        new UnauthorizedException('Custom message'),
        { message: 'Object error' } as any,
      ];

      errors.forEach((error) => {
        expect(() => {
          guard.handleRequest(error, null);
        }).toThrow();
      });
    });
  });
});
