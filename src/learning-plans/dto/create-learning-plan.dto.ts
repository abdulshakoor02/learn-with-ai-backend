import { IsString, IsArray, ValidateNested, IsNotEmpty, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class PhaseDto {
  @IsString()
  @IsNotEmpty()
  focus: string;

  @IsString()
  @IsNotEmpty()
  duration: string;

  @IsArray()
  @IsString({ each: true })
  topics: string[];
}

export class CreateLearningPlanDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  duration: string;

  @IsArray()
  @IsString({ each: true })
  prerequisites: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhaseDto)
  phases: PhaseDto[];

  @IsMongoId()
  userId: string;
}
