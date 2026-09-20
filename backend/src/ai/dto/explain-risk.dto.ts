import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class ExplainRiskDto {
  @ApiProperty({ description: 'Mission ID' })
  @IsString()
  @IsNotEmpty()
  mission_id: string;

  @ApiProperty({
    description: 'Risk metrics from collision assessment',
    properties: {
      probability: { type: 'number', description: 'Collision probability 0-1' },
      minimum_distance_km: {
        type: 'number',
        description: 'Minimum distance in km',
      },
      risk_level: { type: 'string', description: 'Risk level' },
      time_horizon_seconds: {
        type: 'number',
        description: 'Time horizon in seconds',
      },
    },
  })
  @IsObject()
  risk_metrics: {
    probability: number;
    minimum_distance_km: number;
    risk_level: string;
    time_horizon_seconds: number;
  };

  @ApiProperty({
    description: 'Mission context',
    properties: {
      mission_name: { type: 'string' },
      target_name: { type: 'string' },
      robot_name: { type: 'string' },
    },
  })
  @IsObject()
  context: {
    mission_name: string;
    target_name: string;
    robot_name: string;
  };
}
