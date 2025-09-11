import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { Types } from 'mongoose';

// Mock data
const mockUser = {
  _id: new Types.ObjectId().toString(),
  name: 'John Doe',
  email: 'john@example.com',
  mobile: '+1234567890',
  password: '$2b$12$hashedPassword12345678901234567890',
  save: jest.fn().mockResolvedValue({ score: 1 }),
  comparePassword: jest.fn().mockResolvedValue(true),
};

const mockUsers = [
  mockUser,
  {
    _id: new Types.ObjectId().toString(),
    name: 'Jane Smith',
    email: 'jane@example.com',
    mobile: '+0987654321',
    password: '$2b$12$hashedPassword456789012345678901234',
  },
];

// Mock User model
const mockUserModel = {
  find: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockUsers),
  }),
  findById: jest.fn().mockImplementation((id) => ({
    exec: jest.fn().mockResolvedValue(id === mockUser._id ? mockUser : null),
  })),
  findOne: jest.fn().mockImplementation((filter) => {
    let result: any = null;

    if (filter) {
      // Handle mobile queries
      if (filter.mobile === '+1234567890') {
        result = mockUser;
      }
      // Handle email queries
      else if (filter.email === 'john@example.com') {
        result = mockUser;
      }
      // Handle multiple parameter queries
      else if (
        filter.email === 'john@example.com' &&
        filter.name === 'John Doe'
      ) {
        result = mockUser;
      }
      // Handle mobile-only queries
      else if (filter.mobile && filter.mobile !== '+1234567890') {
        result = null;
      }
      // Handle email-only queries
      else if (filter.email && filter.email !== 'john@example.com') {
        result = null;
      }
    }

    return {
      exec: jest.fn().mockResolvedValue(result),
    };
  }),
  findByIdAndUpdate: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockUser),
  }),
  findByIdAndDelete: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockUser),
  }),
  create: jest.fn().mockImplementation((data) => {
    // Simulate password hashing that happens in the schema pre-save hook
    const hashedData = {
      ...data,
      _id: new Types.ObjectId().toString(),
      password: '$2b$12$hashedPassword12345678901234567890', // Mock bcrypt hash
    };
    return {
      ...hashedData,
      save: jest.fn().mockResolvedValue(hashedData),
    };
  }),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        mobile: '+1234567890',
        password: 'plainPassword123',
      };

      const result = await service.create(userData);

      expect(result.name).toBe(userData.name);
      expect(result.email).toBe(userData.email);
      expect(result.mobile).toBe(userData.mobile);
      // Password should be hashed (not the plain text)
      expect(result.password).not.toBe(userData.password);
      expect(result.password).toMatch(/^\$2[aby]\$\d{2}\$.+/); // bcrypt hash pattern
      expect(mockUserModel.create).toHaveBeenCalledWith(userData);
    });

    it('should handle creation errors', async () => {
      const originalCreate = mockUserModel.create;
      mockUserModel.create = jest
        .fn()
        .mockRejectedValueOnce(new Error('Validation error'));

      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        mobile: '+1234567890',
        password: 'plainPassword123',
      };

      await expect(service.create(userData)).rejects.toThrow(
        'Validation error',
      );

      // Restore the original mock
      mockUserModel.create = originalCreate;
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockUserModel.find).toHaveBeenCalled();
      expect(mockUserModel.find().exec).toHaveBeenCalled();
    });

    it('should handle empty results', async () => {
      const originalFind = mockUserModel.find;
      mockUserModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findAll();

      expect(result).toEqual([]);

      // Restore original implementation
      mockUserModel.find = originalFind;
    });
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      const result = await service.findById(mockUser._id);

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith(mockUser._id);
    });

    it('should return null for non-existent ID', async () => {
      const originalFindById = mockUserModel.findById;
      mockUserModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findById('507f1f77bcf86cd799439011');

      expect(result).toBeNull();

      // Restore original implementation
      mockUserModel.findById = originalFindById;
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const result = await service.findByEmail('john@example.com');

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'john@example.com',
      });
    });

    it('should return null for non-existent email', async () => {
      const originalFindOne = mockUserModel.findOne;
      mockUserModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();

      // Restore original implementation
      mockUserModel.findOne = originalFindOne;
    });
  });

  describe('findByMobile', () => {
    it('should find user by mobile', async () => {
      const result = await service.findByMobile('+1234567890');

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        mobile: '+1234567890',
      });
    });

    it('should return null for non-existent mobile', async () => {
      const originalFindOne = mockUserModel.findOne;
      mockUserModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findByMobile('+9999999999');

      expect(result).toBeNull();

      // Restore original implementation
      mockUserModel.findOne = originalFindOne;
    });
  });

  describe('update', () => {
    it('should update user details', async () => {
      const updateData = { name: 'John Updated' };

      const result = await service.update(mockUser._id.toString(), updateData);

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUser._id.toString(),
        updateData,
        { new: true },
      );
    });

    it('should return null if user not found', async () => {
      const originalFindByIdAndUpdate = mockUserModel.findByIdAndUpdate;
      mockUserModel.findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.update('507f1f77bcf86cd799439011', {
        name: 'Updated',
      });

      expect(result).toBeNull();

      // Restore original implementation
      mockUserModel.findByIdAndUpdate = originalFindByIdAndUpdate;
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      const result = await service.delete(mockUser._id.toString());

      expect(result).toBe(true);
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(
        mockUser._id.toString(),
      );
    });

    it('should return false if user not found', async () => {
      const originalFindByIdAndDelete = mockUserModel.findByIdAndDelete;
      mockUserModel.findByIdAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.delete('507f1f77bcf86cd799439011');

      expect(result).toBe(false);

      // Restore original implementation
      mockUserModel.findByIdAndDelete = originalFindByIdAndDelete;
    });
  });

  describe('findByParams', () => {
    it('should find user by multiple parameters', async () => {
      const params = {
        email: 'john@example.com',
        name: 'John Doe',
      };

      const result = await service.findByParams(params);

      expect(result).toEqual(mockUser);
    });

    it('should return null if no parameters provided', async () => {
      await expect(service.findByParams({})).rejects.toThrow(
        'At least one search parameter is required',
      );
    });

    it('should handle undefined parameters', async () => {
      const params = { email: undefined, mobile: '+1234567890' };

      const result = await service.findByParams(params);

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        mobile: '+1234567890',
      });
    });

    it('should handle errors', async () => {
      const originalFindOne = mockUserModel.findOne;
      mockUserModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      const params = { email: 'john@example.com' };

      await expect(service.findByParams(params)).rejects.toThrow(
        'Database error',
      );

      // Restore the original mock
      mockUserModel.findOne = originalFindOne;
    });
  });

  describe('validatePassword', () => {
    it('should validate correct password and return user', async () => {
      const result = await service.validatePassword(
        'john@example.com',
        'correctPassword',
      );

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'john@example.com',
      });
      expect(mockUser.comparePassword).toHaveBeenCalledWith('correctPassword');
    });

    it('should return null for incorrect password', async () => {
      // Save original implementation
      const originalComparePassword = mockUser.comparePassword;
      mockUser.comparePassword = jest.fn().mockResolvedValue(false);

      const result = await service.validatePassword(
        'john@example.com',
        'wrongPassword',
      );

      expect(result).toBeNull();
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'john@example.com',
      });
      expect(mockUser.comparePassword).toHaveBeenCalledWith('wrongPassword');

      // Restore original implementation
      mockUser.comparePassword = originalComparePassword;
    });

    it('should return null for non-existent user', async () => {
      const originalFindOne = mockUserModel.findOne;
      mockUserModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.validatePassword(
        'nonexistent@example.com',
        'anyPassword',
      );

      expect(result).toBeNull();
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'nonexistent@example.com',
      });

      // Restore original implementation
      mockUserModel.findOne = originalFindOne;
    });

    it('should handle validation errors', async () => {
      const originalFindOne = mockUserModel.findOne;
      mockUserModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(
        service.validatePassword('john@example.com', 'anyPassword'),
      ).rejects.toThrow('Database error');

      // Restore the original mock
      mockUserModel.findOne = originalFindOne;
    });
  });
});
