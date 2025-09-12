import { validate } from 'class-validator';
import { UserQueryDto } from './user-query.dto';

describe('UserQueryDto', () => {
  describe('Validation Decorators', () => {
    it('should validate valid UUID for id field', async () => {
      const dto = new UserQueryDto();
      dto.id = '9cec979c-ee80-4e50-aa6f-66259f4284cb'; // Valid UUID v4

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should invalidate invalid UUID for id field', async () => {
      const dto = new UserQueryDto();
      dto.id = 'invalid-uuid';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('id');
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });

    it('should validate valid email for email field', async () => {
      const dto = new UserQueryDto();
      dto.email = 'test@example.com';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should invalidate invalid email for email field', async () => {
      const dto = new UserQueryDto();
      dto.email = 'invalid-email';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('should validate string fields', async () => {
      const dto = new UserQueryDto();
      dto.name = 'John Doe';
      dto.mobile = '+1234567890';
      dto.password = 'password123';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should invalidate non-string fields', async () => {
      const dto = new UserQueryDto();
      dto.name = 123 as any;
      dto.mobile = {} as any;

      const errors = await validate(dto);
      expect(errors).toHaveLength(2);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('isString');
      expect(errors[1].property).toBe('mobile');
      expect(errors[1].constraints).toHaveProperty('isString');
    });

    it('should allow optional fields to be undefined', async () => {
      const dto = new UserQueryDto();
      // All fields are optional and undefined by default

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should allow empty string for optional fields', async () => {
      const dto = new UserQueryDto();
      dto.name = '';
      dto.email = '';

      const errors = await validate(dto);
      // Empty strings should pass string validation but fail email validation
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
    });
  });

  describe('Static validate method', () => {
    it('should validate that at least one field is provided', () => {
      const result = UserQueryDto.validate({});
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('At least one search parameter');
    });

    it('should validate that data is an object', () => {
      const result = UserQueryDto.validate(null);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain(
        'Request body must be a JavaScript object',
      );

      const result2 = UserQueryDto.validate('string');
      expect(result2.isValid).toBe(false);
      expect(result2.message).toContain(
        'Request body must be a JavaScript object',
      );
    });

    it('should return valid when at least one field is provided', () => {
      const testCases = [
        { id: '9cec979c-ee80-4e50-aa6f-66259f4284cb' },
        { name: 'John Doe' },
        { email: 'test@example.com' },
        { mobile: '+1234567890' },
        { password: 'secret' },
        { id: '9cec979c-ee80-4e50-aa6f-66259f4284cb', name: 'John Doe' },
      ];

      testCases.forEach((data) => {
        const result = UserQueryDto.validate(data);
        expect(result.isValid).toBe(true);
        expect(result.message).toBe('');
      });
    });

    it('should ignore non-allowed fields', () => {
      const data = {
        unknownField: 'value',
        anotherField: 123,
      };

      const result = UserQueryDto.validate(data);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('At least one search parameter');
    });

    it('should ignore undefined values', () => {
      const data = {
        id: undefined,
        name: undefined,
        email: undefined,
      };

      const result = UserQueryDto.validate(data);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('At least one search parameter');
    });

    it('should consider null values as provided', () => {
      const data = {
        name: null,
      };

      const result = UserQueryDto.validate(data);
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should consider empty string values as provided', () => {
      const data = {
        name: '',
      };

      const result = UserQueryDto.validate(data);
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should consider zero values as provided', () => {
      const data = {
        // This test ensures that if someone passes non-string values,
        // they're still considered as "provided" for the validation
        someNumber: 0,
      };

      const result = UserQueryDto.validate(data);
      expect(result.isValid).toBe(false); // false because someNumber is not an allowed field
      expect(result.message).toContain('At least one search parameter');
    });

    it('should handle complex nested objects', () => {
      const data = {
        id: '9cec979c-ee80-4e50-aa6f-66259f4284cb',
        nested: { prop: 'value' },
      };

      const result = UserQueryDto.validate(data);
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('');
    });
  });

  describe('Integration with class-validator', () => {
    it('should work with class-validator validate function', async () => {
      const dto = new UserQueryDto();
      dto.email = 'invalid-email';
      dto.name = 123 as any;

      const errors = await validate(dto);
      expect(errors).toHaveLength(2);
      expect(errors.some((e) => e.property === 'email')).toBe(true);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });

    it('should pass validation for valid data', async () => {
      const dto = new UserQueryDto();
      dto.id = '9cec979c-ee80-4e50-aa6f-66259f4284cb'; // Valid UUID v4
      dto.email = 'test@example.com';
      dto.name = 'John Doe';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
