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
} from '@nestjs/common';
import { TopicsService } from './topics.service';
import { Topic } from './schemas/topic.schema';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Controller('topics')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Post()
  async create(@Body() createTopicDto: CreateTopicDto): Promise<Topic> {
    try {
      return await this.topicsService.create(createTopicDto);
    } catch (error: any) {
      if (error.code === 11000) {
        throw new HttpException(
          { message: 'Topic with this name already exists' },
          HttpStatus.CONFLICT,
        );
      }
      throw error;
    }
  }

  @Get()
  async findAll(): Promise<Topic[]> {
    return this.topicsService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Topic | null> {
    const topic = await this.topicsService.findById(id);
    if (!topic) {
      throw new HttpException(
        { message: 'Topic not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    return topic;
  }

  @Get('name/:topicName')
  async findByTopicName(
    @Param('topicName') topicName: string,
  ): Promise<Topic | null> {
    const topic = await this.topicsService.findByTopicName(topicName);
    if (!topic) {
      throw new HttpException(
        { message: 'Topic not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    return topic;
  }

  @Post('search')
  async searchByTopicName(
    @Body('topicName') topicName: string,
  ): Promise<Topic | { message: string }> {
    const topic = await this.topicsService.findByTopicName(topicName);
    if (!topic) {
      return { message: 'Topic not found' };
    }
    return topic;
    //
    // if (!topicName) {
    //   throw new HttpException(
    //     { message: 'Topic name is required for search' },
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
    // return this.topicsService.searchByTopicName(topicName);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTopicDto: UpdateTopicDto,
  ): Promise<Topic | null> {
    try {
      const topic = await this.topicsService.update(id, updateTopicDto);
      if (!topic) {
        throw new HttpException(
          { message: 'Topic not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      return topic;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new HttpException(
          { message: 'Topic with this name already exists' },
          HttpStatus.CONFLICT,
        );
      }
      throw error;
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<boolean> {
    const result = await this.topicsService.delete(id);
    if (!result) {
      throw new HttpException(
        { message: 'Topic not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    return result;
  }
}
