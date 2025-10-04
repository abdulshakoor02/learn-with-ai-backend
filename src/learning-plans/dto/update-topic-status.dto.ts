import { IsString, IsNotEmpty, IsMongoId, IsBoolean } from 'class-validator';

export class UpdateTopicStatusDto {
  @IsMongoId()
  learningPlanId: string;

  @IsString()
  @IsNotEmpty()
  topicTitle: string;

  @IsBoolean()
  status: boolean;
}
