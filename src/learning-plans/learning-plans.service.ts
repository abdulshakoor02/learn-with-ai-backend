import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LearningPlan, LearningPlanDocument } from './schemas/learning-plan.schema';
import { CreateLearningPlanDto } from './dto/create-learning-plan.dto';
import { UpdateLearningPlanDto } from './dto/update-learning-plan.dto';

@Injectable()
export class LearningPlansService {
  constructor(
    @InjectModel(LearningPlan.name)
    private learningPlanModel: Model<LearningPlanDocument>,
  ) {}

  async create(createLearningPlanDto: CreateLearningPlanDto): Promise<LearningPlan> {
    try {
      // Transform the phases data to handle string topics conversion
      const transformedData = this.transformPhasesData(createLearningPlanDto);
      
      const createdLearningPlan = new this.learningPlanModel(transformedData);
      return await createdLearningPlan.save();
    } catch (error) {
      console.error('Error creating learning plan:', error);
      throw error;
    }
  }

  private transformPhasesData(data: CreateLearningPlanDto): CreateLearningPlanDto {
    return {
      ...data,
      phases: data.phases.map(phase => ({
        focus: phase.focus,
        status: phase.status ?? false, // Default to false if not provided
        duration: phase.duration,
        topics: phase.topics.map(topic => {
          // Handle both string and object formats for topics
          if (typeof topic === 'string') {
            return {
              title: topic,
              status: false
            };
          } else {
            return {
              title: topic.title,
              status: topic.status ?? false // Default to false if not provided
            };
          }
        })
      }))
    };
  }

  async findAll(): Promise<LearningPlan[]> {
    try {
      return await this.learningPlanModel.find().exec();
    } catch (error) {
      console.error('Error finding learning plans:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<LearningPlan> {
    try {
      const learningPlan = await this.learningPlanModel.findById(id).exec();
      if (!learningPlan) {
        throw new NotFoundException(`Learning plan with ID ${id} not found`);
      }
      return learningPlan;
    } catch (error) {
      console.error('Error finding learning plan:', error);
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<LearningPlan[]> {
    try {
      return await this.learningPlanModel
        .find({ userId, isActive: true })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      console.error('Error finding learning plans by user ID:', error);
      throw error;
    }
  }

  async update(
    id: string,
    updateLearningPlanDto: UpdateLearningPlanDto,
  ): Promise<LearningPlan> {
    try {
      const updatedLearningPlan = await this.learningPlanModel
        .findByIdAndUpdate(id, updateLearningPlanDto, { new: true })
        .exec();
      
      if (!updatedLearningPlan) {
        throw new NotFoundException(`Learning plan with ID ${id} not found`);
      }
      
      return updatedLearningPlan;
    } catch (error) {
      console.error('Error updating learning plan:', error);
      throw error;
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const result = await this.learningPlanModel.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundException(`Learning plan with ID ${id} not found`);
      }
      return { message: 'Learning plan deleted successfully' };
    } catch (error) {
      console.error('Error deleting learning plan:', error);
      throw error;
    }
  }
}
