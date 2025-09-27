import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LearningPlanDocument = LearningPlan & Document;

export interface Topic {
  title: string;
  status: boolean;
}

export interface Phase {
  focus: string;
  status: boolean;
  duration: string;
  topics: Topic[];
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
        status: { type: Boolean, default: false },
        duration: { type: String, required: true },
        topics: [
          {
            title: { type: String, required: true },
            status: { type: Boolean, default: false },
          },
        ],
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
