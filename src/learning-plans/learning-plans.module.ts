import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LearningPlansController } from './learning-plans.controller';
import { LearningPlansService } from './learning-plans.service';
import { LearningPlan, LearningPlanSchema } from './schemas/learning-plan.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LearningPlan.name, schema: LearningPlanSchema },
    ]),
  ],
  controllers: [LearningPlansController],
  providers: [LearningPlansService],
  exports: [LearningPlansService],
})
export class LearningPlansModule {}
