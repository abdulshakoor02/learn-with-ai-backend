import { IsString, IsNotEmpty, IsMongoId, IsBoolean } from 'class-validator';

export class UpdatePhaseStatusDto {
  @IsMongoId()
  learningPlanId: string;

  @IsString()
  @IsNotEmpty()
  phaseName: string;

  @IsBoolean()
  status: boolean;
}