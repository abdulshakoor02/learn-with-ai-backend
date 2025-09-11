import {
  IsEmail,
  IsString,
  IsOptional,
  IsUUID,
  IsObject,
} from 'class-validator';

export class UserQueryDto {
  @IsOptional()
  @IsUUID('4', { message: 'ID must be a valid UUID v4' })
  id?: string;

  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Mobile must be a string' })
  mobile?: string;

  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  password?: string;

  /**
   * Validate that at least one field is provided
   */
  static validate(data: any): { isValid: boolean; message: string } {
    if (!data || !IsObject(data)) {
      return {
        isValid: false,
        message: 'Request body must be a JavaScript object',
      };
    }

    const allowedFields = ['id', 'name', 'email', 'mobile', 'password'];
    const providedFields = Object.keys(data).filter(
      (key) => allowedFields.includes(key) && data[key] !== undefined,
    );

    if (providedFields.length === 0) {
      return {
        isValid: false,
        message:
          'At least one search parameter (id, name, email, mobile, password) must be provided',
      };
    }

    return { isValid: true, message: '' };
  }
}
