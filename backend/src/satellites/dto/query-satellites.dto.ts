import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { SatelliteType } from './create-satellite.dto';

export class QuerySatellitesDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by NORAD ID' })
  @IsOptional()
  @IsInt()
  @Min(0)
  norad_id?: number;

  @ApiPropertyOptional({
    enum: SatelliteType,
    description: 'Filter by satellite type',
  })
  @IsOptional()
  @IsEnum(SatelliteType)
  satellite_type?: SatelliteType;

  @ApiPropertyOptional({ description: 'Filter by international code' })
  @IsOptional()
  @IsString()
  intl_code?: string;

  @ApiPropertyOptional({ description: 'Filter by space object ID' })
  @IsOptional()
  @IsString()
  space_object_id?: string;
}
