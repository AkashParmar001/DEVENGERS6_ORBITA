import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  IsObject,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SpaceObjectType {
  SATELLITE = 'SATELLITE',
  DEBRIS = 'DEBRIS',
  ROCKET_BODY = 'ROCKET_BODY',
  ROBOT = 'ROBOT',
  SPACECRAFT = 'SPACECRAFT',
}

export enum SpaceObjectStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DECOMMISSIONED = 'decommissioned',
  LOST = 'lost',
}

export enum OrbitType {
  LEO = 'LEO',
  MEO = 'MEO',
  GEO = 'GEO',
  HEO = 'HEO',
  CISLUNAR = 'cislunar',
  INTERPLANETARY = 'interplanetary',
}

export class CreateSpaceObjectDto {
  @ApiProperty({ example: 'ISS-ZARYA' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: SpaceObjectType, example: SpaceObjectType.SATELLITE })
  @IsEnum(SpaceObjectType)
  @IsNotEmpty()
  object_type: SpaceObjectType;

  @ApiPropertyOptional({
    enum: SpaceObjectStatus,
    default: SpaceObjectStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(SpaceObjectStatus)
  status?: SpaceObjectStatus;

  @ApiPropertyOptional({ example: 420000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  mass_kg?: number;

  @ApiPropertyOptional({ example: { length: 109, width: 73, height: 45 } })
  @IsOptional()
  @IsObject()
  dimensions_m?: Record<string, number>;

  @ApiPropertyOptional({ example: '1998-067A' })
  @IsOptional()
  @IsDateString()
  launch_date?: string;

  @ApiPropertyOptional({ example: 'NASA' })
  @IsOptional()
  @IsString()
  operator?: string;

  @ApiPropertyOptional({ example: 'USA' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ enum: OrbitType, example: OrbitType.LEO })
  @IsOptional()
  @IsEnum(OrbitType)
  orbit_type?: OrbitType;
}
