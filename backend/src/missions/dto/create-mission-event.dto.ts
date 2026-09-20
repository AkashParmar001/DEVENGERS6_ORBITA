import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MissionEventType {
  MISSION_CREATED = 'MISSION_CREATED',
  TARGET_IDENTIFIED = 'TARGET_IDENTIFIED',
  PLANNING_STARTED = 'PLANNING_STARTED',
  PLAN_GENERATED = 'PLAN_GENERATED',
  VALIDATION_STARTED = 'VALIDATION_STARTED',
  VALIDATION_COMPLETED = 'VALIDATION_COMPLETED',
  SIMULATION_STARTED = 'SIMULATION_STARTED',
  SIMULATION_PAUSED = 'SIMULATION_PAUSED',
  ANOMALY_DETECTED = 'ANOMALY_DETECTED',
  MISSION_COMPLETED = 'MISSION_COMPLETED',
  MISSION_FAILED = 'MISSION_FAILED',
  MISSION_ABORTED = 'MISSION_ABORTED',
}

export enum EventSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
  SUCCESS = 'success',
}

export class CreateMissionEventDto {
  @ApiProperty({ enum: MissionEventType })
  @IsEnum(MissionEventType)
  @IsNotEmpty()
  event_type: MissionEventType;

  @ApiPropertyOptional({ enum: EventSeverity, default: EventSeverity.INFO })
  @IsOptional()
  @IsEnum(EventSeverity)
  severity?: EventSeverity;

  @ApiProperty({ example: 'Mission created' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Mission SAT-102 inspection created' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: Object, description: 'Event metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}
