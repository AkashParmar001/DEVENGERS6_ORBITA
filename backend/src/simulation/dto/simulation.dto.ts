import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SimOrbitalStateDto {
  @ApiProperty({ type: [Number] })
  @IsArray()
  position_km: number[];

  @ApiProperty({ type: [Number] })
  @IsArray()
  velocity_kms: number[];
}

export class SimulationRunRequestDto {
  @ApiProperty({ description: 'Mission UUID' })
  @IsString()
  @IsNotEmpty()
  mission_id: string;

  @ApiProperty({ description: 'Robot orbital state' })
  @ValidateNested()
  @Type(() => SimOrbitalStateDto)
  robot_state: SimOrbitalStateDto;

  @ApiProperty({ description: 'Target orbital state' })
  @ValidateNested()
  @Type(() => SimOrbitalStateDto)
  target_state: SimOrbitalStateDto;

  @ApiProperty({ description: 'Simulation duration in seconds' })
  @IsNumber()
  @Min(1)
  duration_seconds: number;

  @ApiProperty({ description: 'Time acceleration factor', default: 1.0 })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  time_scale?: number = 1.0;

  @ApiProperty({ description: 'Time step in seconds', default: 60 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  time_step_seconds?: number = 60;
}

export class SimulationRunResponseDto {
  @ApiProperty()
  summary: Record<string, any>;

  @ApiProperty({ type: [Object] })
  telemetry: Record<string, any>[];

  @ApiProperty({ type: [Object] })
  events: Record<string, any>[];
}
