import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { Types } from 'mongoose';

const mockUserId = new Types.ObjectId().toString();
const mockUser = {
  _id: mockUserId,
  name: 'John Doe',
  email: 'john@example.com',
  mobile: '+1234567890',
  password: 'hashedPassword123',
};

const mockUsers = [
  mockUser,
  {
    _id: '660e8400-e29b-41d4-a716-446655440001',
    name: 'Jane Smith',
    email: 'jane@example.com',
    mobile: '+0987654321',
    password: 'hashedPassword456',
  },
];

const mockUsersService = {
  create: jest.fn().mockResolvedValue(mockUser),
  findAll: jest.fn().mockResolvedValue(mockUsers),
  findById: jest.fn().mockResolvedValue(mockUser),
  findByEmail: jest.fn().mockResolvedValue(mockUser),
  findByMobile: jest.fn().mockResolvedValue(mockUser),
  update: jest.fn().mockResolvedValue(mockUser),
  delete: jest.fn().mockResolvedValue(true),
  findByParams: jest.fn().mockResolvedValue(mockUser),
};

const mockAuthService = {
  validateUser: jest.fn(),
  login: jest.fn(),
  validateToken: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        mobile: '+1234567890',
        password: 'hashedPassword123',
      };

      const result = await controller.create(userData);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(userData);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const result = await controller.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      const result = await controller.findById(mockUser._id);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findById).toHaveBeenCalledWith(mockUser._id);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const email = 'john@example.com';
      const result = await controller.findByEmail(email);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('findByMobile', () => {
    it('should find user by mobile', async () => {
      const mobile = '+1234567890';
      const result = await controller.findByMobile(mobile);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findByMobile).toHaveBeenCalledWith(mobile);
    });
  });

  describe('update', () => {
    it('should update user details', async () => {
      const updateData = { name: 'John Updated' };

      const result = await controller.update(mockUserId.toString(), updateData);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        mockUserId.toString(),
        updateData,
      );
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      const result = await controller.delete(mockUserId.toString());

      expect(result).toBe(true);
      expect(mockUsersService.delete).toHaveBeenCalledWith(
        mockUserId.toString(),
      );
    });
  });
});
