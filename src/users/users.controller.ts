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
  ): Promise<User> {
    return this.usersService.create(userData);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<User | null> {
    return this.usersService.findById(id);
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<User | null> {
    return this.usersService.findByEmail(email);
  }

  @Get('mobile/:mobile')
  async findByMobile(@Param('mobile') mobile: string): Promise<User | null> {
    return this.usersService.findByMobile(mobile);
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
  ): Promise<User | null> {
    return this.usersService.update(id, updateData);
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
  ): Promise<User | null> {
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

    return this.usersService.findByParams(cleanParams);
  }
}
