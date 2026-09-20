import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrbitalStateDto {
  @ApiProperty({
    description: 'Position [x, y, z] in km (ECI)',
    example: [7000, 0, 0],
  })
  @IsArray()
  position_km: [number, number, number];

  @ApiProperty({
    description: 'Velocity [vx, vy, vz] in km/s (ECI)',
    example: [0, 7.5, 0],
  })
  @IsArray()
  velocity_kms: [number, number, number];

  @ApiProperty({ description: 'Time epoch in seconds', default: 0 })
  @IsOptional()
  @IsNumber()
  epoch_seconds?: number = 0;
}

export class TrajectoryPlanRequestDto {
  @ApiProperty({ description: 'Robot orbital state' })
  @ValidateNested()
  @Type(() => OrbitalStateDto)
  robot_state: OrbitalStateDto;

  @ApiProperty({ description: 'Target orbital state' })
  @ValidateNested()
  @Type(() => OrbitalStateDto)
  target_state: OrbitalStateDto;

  @ApiProperty({ description: 'Max delta-v budget in m/s', default: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  max_delta_v_ms?: number = 500;

  @ApiProperty({ description: 'Max time budget in seconds', default: 86400 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  time_budget_seconds?: number = 86400;

  @ApiProperty({
    description: 'Number of waypoints',
    default: 5,
    minimum: 2,
    maximum: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(2)
  @Max(50)
  num_waypoints?: number = 5;
}

export class WaypointDto {
  @ApiProperty({ description: 'Position [x, y, z] in km' })
  position_km: [number, number, number];

  @ApiProperty({ description: 'Velocity [vx, vy, vz] in km/s' })
  velocity_kms: [number, number, number];

  @ApiProperty({ description: 'Time in seconds from departure' })
  time_seconds: number;

  @ApiProperty({ description: 'Waypoint label' })
  label: string;
}

export class TrajectoryPlanResponseDto {
  @ApiProperty({ description: 'Trajectory waypoints', type: [WaypointDto] })
  trajectory: WaypointDto[];

  @ApiProperty({ description: 'Transfer duration in seconds' })
  duration_seconds: number;

  @ApiProperty({ description: 'Total delta-v in m/s' })
  delta_v_ms: number;

  @ApiProperty({ description: 'Estimated fuel consumption in kg' })
  fuel_estimate_kg: number;

  @ApiProperty({ description: 'Whether trajectory is feasible' })
  feasible: boolean;

  @ApiProperty({ description: 'Infeasibility reason', required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ description: 'Maneuver type' })
  maneuver_type: string;

  @ApiProperty({ description: 'Transfer semi-major axis in km' })
  semi_major_axis_km: number;

  @ApiProperty({ description: 'Transfer eccentricity' })
  eccentricity: number;

  @ApiProperty({ description: 'Inclination in degrees' })
  inclination_deg: number;
}

export class CollisionRiskRequestDto {
  @ApiProperty({ description: 'Object A orbital state' })
  @ValidateNested()
  @Type(() => OrbitalStateDto)
  object_a: OrbitalStateDto;

  @ApiProperty({ description: 'Object B orbital state' })
  @ValidateNested()
  @Type(() => OrbitalStateDto)
  object_b: OrbitalStateDto;

  @ApiProperty({ description: 'Time horizon in seconds', default: 3600 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(86400)
  time_horizon_seconds?: number = 3600;

  @ApiProperty({ description: 'Time step in seconds', default: 60 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3600)
  time_step_seconds?: number = 60;

  @ApiProperty({ description: 'Collision radius in km', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0.001)
  @Max(1000)
  collision_radius_km?: number = 10;
}

export class CollisionRiskResponseDto {
  @ApiProperty({
    description: 'Risk level',
    enum: ['negligible', 'low', 'medium', 'high', 'critical'],
  })
  risk_level: string;

  @ApiProperty({ description: 'Collision probability (0-1)' })
  probability: number;

  @ApiProperty({ description: 'Minimum approach distance in km' })
  minimum_distance_km: number;

  @ApiProperty({ description: 'Time to closest approach in seconds' })
  time_to_closest_approach_seconds: number;

  @ApiProperty({ description: 'Miss velocity in km/s' })
  miss_velocity_kms: number;

  @ApiProperty({ description: 'Number of propagation steps' })
  propagation_steps: number;

  @ApiProperty({ description: 'Object A positions' })
  object_a_positions: [number, number, number][];

  @ApiProperty({ description: 'Object B positions' })
  object_b_positions: [number, number, number][];

  @ApiProperty({ description: 'Distances at each step in km' })
  distances_km: number[];

  @ApiProperty({ description: 'Human-readable assessment' })
  assessment: string;
}

export class IntelligenceHealthDto {
  @ApiProperty()
  status: string;

  @ApiProperty()
  version: string;

  @ApiProperty()
  orbital_engine: string;

  @ApiProperty()
  trajectory_engine: string;

  @ApiProperty()
  risk_engine: string;
}
