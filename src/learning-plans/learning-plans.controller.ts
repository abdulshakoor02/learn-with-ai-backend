import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { LearningPlansService } from './learning-plans.service';
import { CreateLearningPlanDto } from './dto/create-learning-plan.dto';
import { UpdateLearningPlanDto } from './dto/update-learning-plan.dto';
import { UpdatePhaseStatusDto } from './dto/update-phase-status.dto';
import { UpdateTopicStatusDto } from './dto/update-topic-status.dto';

@Controller('learning-plans')
export class LearningPlansController {
  constructor(private readonly learningPlansService: LearningPlansService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() createLearningPlanDto: CreateLearningPlanDto) {
    return this.learningPlansService.create(createLearningPlanDto);
  }

  @Get()
  async findAll(@Query('userId') userId?: string) {
    if (userId) {
      return this.learningPlansService.findByUserId(userId);
    }
    return this.learningPlansService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.learningPlansService.findOne(id);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    return this.learningPlansService.findByUserId(userId);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() updateLearningPlanDto: UpdateLearningPlanDto,
  ) {
    return this.learningPlansService.update(id, updateLearningPlanDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.learningPlansService.remove(id);
  }

  @Post('phases/status')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updatePhaseStatus(@Body() updatePhaseStatusDto: UpdatePhaseStatusDto) {
    return this.learningPlansService.updatePhaseStatus(updatePhaseStatusDto);
  }

  @Post('topics/status')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateTopicStatus(@Body() updateTopicStatusDto: UpdateTopicStatusDto) {
    return this.learningPlansService.updateTopicStatus(updateTopicStatusDto);
  }
}
