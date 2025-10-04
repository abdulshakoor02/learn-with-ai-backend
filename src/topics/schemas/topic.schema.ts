import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TopicDocument = Topic & Document;

@Schema({
  timestamps: true,
  collection: 'topics',
})
export class Topic {
  @Prop({ required: true, unique: true })
  topicName: string;

  @Prop({ required: true })
  content: string;
}

export const TopicSchema = SchemaFactory.createForClass(Topic);
