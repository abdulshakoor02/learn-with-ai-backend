import {
  IsString,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsMongoId,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TopicDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}

export class PhaseDto {
  @IsString()
  @IsNotEmpty()
  focus: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsString()
  @IsNotEmpty()
  duration: string;

  @IsArray()
  topics: (string | TopicDto)[];
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
