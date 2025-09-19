import { PartialType } from '@nestjs/mapped-types';
import { CreateLearningPlanDto } from './create-learning-plan.dto';

export class UpdateLearningPlanDto extends PartialType(CreateLearningPlanDto) {}
