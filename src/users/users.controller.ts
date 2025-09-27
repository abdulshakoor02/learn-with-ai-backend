import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpStatus,
  HttpException,
  ValidationPipe,
  UsePipes,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { User } from './schemas/user.schema';
import { UserQueryDto } from './dto/user-query.dto';

// Helper function to remove password from user object
function excludePassword(user: any): Omit<User, 'password'> {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword as Omit<User, 'password'>;
}

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  async create(
    @Body()
    userData: {
      name: string;
      email: string;
      mobile: string;
      password: string;
    },
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.create(userData);
    return excludePassword(user);
  }

  @Get()
  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.usersService.findAll();
    return users.map(user => excludePassword(user));
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findById(id);
    if (!user) return null;
    const userObj = user.toObject ? user.toObject() : user;
    return excludePassword(userObj);
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const userObj = user.toObject ? user.toObject() : user;
    return excludePassword(userObj);
  }

  @Get('mobile/:mobile')
  async findByMobile(@Param('mobile') mobile: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByMobile(mobile);
    if (!user) return null;
    const userObj = user.toObject ? user.toObject() : user;
    return excludePassword(userObj);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    updateData: Partial<{
      name: string;
      email: string;
      mobile: string;
      password: string;
    }>,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.update(id, updateData);
    if (!user) return null;
    const userObj = user.toObject ? user.toObject() : user;
    return excludePassword(userObj);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<boolean> {
    return this.usersService.delete(id);
  }

  /**
   * Find users by multiple parameters
   * Supports complex queries with email, mobile, name, id, or password
   * @param queryParams - Object containing search criteria
   * @returns User object or null if not found
   */
  @Post('search')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async findByMultipleParams(
    @Body() queryParams: UserQueryDto,
  ): Promise<Omit<User, 'password'> | null> {
    const validation = UserQueryDto.validate(queryParams);
    if (!validation.isValid) {
      throw new HttpException(
        { success: false, error: validation.message },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Call the service with only the defined parameters
    const cleanParams = Object.fromEntries(
      Object.entries(queryParams).filter(
        ([key, value]) => value !== undefined && value !== '',
      ),
    );

    const user = await this.usersService.findByParams(cleanParams);
    if (!user) return null;
    const userObj = user.toObject ? user.toObject() : user;
    return excludePassword(userObj);
  }
}
