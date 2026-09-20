import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsInt,
  Matches,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export enum SatelliteType {
  COMMUNICATION = 'communication',
  NAVIGATION = 'navigation',
  OBSERVATION = 'observation',
  SCIENCE = 'science',
  MILITARY = 'military',
  COMMERCIAL = 'commercial',
}

export class CreateSatelliteDto {
  @ApiProperty({ format: 'uuid', description: 'ID of the parent space object' })
  @Matches(UUID_REGEX, { message: 'space_object_id must be a valid UUID' })
  @IsNotEmpty()
  space_object_id: string;

  @ApiPropertyOptional({ example: 25544 })
  @IsOptional()
  @IsInt()
  @Min(0)
  norad_id?: number;

  @ApiPropertyOptional({ example: '1998-067A' })
  @IsOptional()
  @IsString()
  intl_code?: string;

  @ApiPropertyOptional({
    enum: SatelliteType,
    example: SatelliteType.COMMUNICATION,
  })
  @IsOptional()
  @IsEnum(SatelliteType)
  satellite_type?: SatelliteType;

  @ApiPropertyOptional({ example: 10000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  power_watts?: number;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  design_life_years?: number;
}
