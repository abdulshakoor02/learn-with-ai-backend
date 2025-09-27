import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(userData: {
    name: string;
    email: string;
    mobile: string;
    password: string;
  }): Promise<UserDocument> {
    try {
      // Password will be automatically hashed by the schema pre-save hook
      return await this.userModel.create(userData);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async findAll(): Promise<UserDocument[]> {
    try {
      return await this.userModel.find().exec();
    } catch (error) {
      console.error('Error finding users:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<UserDocument | null> {
    try {
      return await this.userModel.findById(id).exec();
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    try {
      return await this.userModel.findOne({ email }).exec();
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  async findByMobile(mobile: string): Promise<UserDocument | null> {
    try {
      return await this.userModel.findOne({ mobile }).exec();
    } catch (error) {
      console.error('Error finding user by mobile:', error);
      throw error;
    }
  }

  async update(
    id: string,
    updateData: Partial<{
      name: string;
      email: string;
      mobile: string;
      password: string;
    }>,
  ): Promise<UserDocument | null> {
    try {
      return await this.userModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .exec();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.userModel.findByIdAndDelete(id).exec();
      return result !== null;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Find users by multiple parameters
   * @param params - Object containing search criteria
   * @returns User or null if not found
   * @example { email: 'john@example.com', password: 'hashedPassword123' }
   * @example { mobile: '+1234567890', name: 'John' }
   */
  async findByParams(params: {
    name?: string;
    email?: string;
    mobile?: string;
    password?: string;
    id?: string;
  }): Promise<UserDocument | null> {
    try {
      if (!params || Object.keys(params).length === 0) {
        throw new Error('At least one search parameter is required');
      }

      // Build MongoDB query from non-undefined parameters
      const query: Record<string, any> = {};
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== '') {
          query[key] = value;
        }
      }

      if (Object.keys(query).length === 0) {
        throw new Error('All search parameters are undefined');
      }

      return await this.userModel.findOne(query).exec();
    } catch (error) {
      console.error('Error finding user by parameters:', error);
      throw error;
    }
  }

  async validatePassword(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    try {
      const user = await this.findByEmail(email);
      if (!user) {
        return null;
      }

      const isValid = await user.comparePassword(password);
      return isValid ? user : null;
    } catch (error) {
      console.error('Error validating password:', error);
      throw error;
    }
  }
}
