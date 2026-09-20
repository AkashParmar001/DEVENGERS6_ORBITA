import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  Matches,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export enum MissionStatus {
  DRAFT = 'DRAFT',
  PLANNING = 'PLANNING',
  VALIDATING = 'VALIDATING',
  READY = 'READY',
  SIMULATING = 'SIMULATING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ABORTING = 'ABORTING',
  ABORTED = 'ABORTED',
}

export class CreateMissionDto {
  @ApiProperty({ example: 'SAT-102 INSPECTION' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Inspect SAT-102 for structural damage' })
  @IsString()
  @IsNotEmpty()
  objective: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Target space object ID',
  })
  @IsOptional()
  @Matches(UUID_REGEX, { message: 'target_id must be a valid UUID' })
  target_id?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Robot space object ID' })
  @IsOptional()
  @Matches(UUID_REGEX, { message: 'robot_id must be a valid UUID' })
  robot_id?: string;

  @ApiPropertyOptional({ enum: MissionStatus, default: MissionStatus.DRAFT })
  @IsOptional()
  @IsEnum(MissionStatus)
  status?: MissionStatus;

  @ApiPropertyOptional({ example: 5, minimum: 0, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  priority?: number;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'User who created the mission',
  })
  @IsOptional()
  @Matches(UUID_REGEX, { message: 'created_by must be a valid UUID' })
  created_by?: string;
}
