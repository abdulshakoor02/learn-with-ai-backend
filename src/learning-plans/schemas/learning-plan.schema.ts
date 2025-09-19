import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LearningPlanDocument = LearningPlan & Document;

export interface Phase {
  focus: string;
  duration: string;
  topics: string[];
}

@Schema({
  timestamps: true,
  collection: 'learning_plans',
})
export class LearningPlan {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  duration: string;

  @Prop({ type: [String], required: true })
  prerequisites: string[];

  @Prop({
    type: [
      {
        focus: { type: String, required: true },
        duration: { type: String, required: true },
        topics: { type: [String], required: true },
      },
    ],
    required: true,
  })
  phases: Phase[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const LearningPlanSchema = SchemaFactory.createForClass(LearningPlan);
