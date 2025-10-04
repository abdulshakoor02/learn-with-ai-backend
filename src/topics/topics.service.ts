import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Topic, TopicDocument } from './schemas/topic.schema';

@Injectable()
export class TopicsService {
  constructor(
    @InjectModel(Topic.name) private topicModel: Model<TopicDocument>,
  ) {}

  async create(topicData: {
    topicName: string;
    content: string;
  }): Promise<TopicDocument> {
    try {
      return await this.topicModel.create(topicData);
    } catch (error) {
      console.error('Error creating topic:', error);
      throw error;
    }
  }

  async findAll(): Promise<TopicDocument[]> {
    try {
      return await this.topicModel.find().exec();
    } catch (error) {
      console.error('Error finding topics:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<TopicDocument | null> {
    try {
      return await this.topicModel.findById(id).exec();
    } catch (error) {
      console.error('Error finding topic by ID:', error);
      throw error;
    }
  }

  async findByTopicName(topicName: string): Promise<TopicDocument | null> {
    try {
      return await this.topicModel.findOne({ topicName }).exec();
    } catch (error) {
      console.error('Error finding topic by name:', error);
      throw error;
    }
  }

  async update(
    id: string,
    updateData: Partial<{
      topicName: string;
      content: string;
    }>,
  ): Promise<TopicDocument | null> {
    try {
      return await this.topicModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .exec();
    } catch (error) {
      console.error('Error updating topic:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.topicModel.findByIdAndDelete(id).exec();
      return result !== null;
    } catch (error) {
      console.error('Error deleting topic:', error);
      throw error;
    }
  }

  async searchByTopicName(topicName: string): Promise<TopicDocument[]> {
    try {
      return await this.topicModel
        .find({ topicName: { $regex: topicName, $options: 'i' } })
        .exec();
    } catch (error) {
      console.error('Error searching topics by name:', error);
      throw error;
    }
  }
}
