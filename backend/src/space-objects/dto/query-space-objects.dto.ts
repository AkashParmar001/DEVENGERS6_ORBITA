import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import {
  SpaceObjectType,
  SpaceObjectStatus,
  OrbitType,
} from './create-space-object.dto';

export class QuerySpaceObjectsDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by name (partial match)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    enum: SpaceObjectType,
    description: 'Filter by object type',
  })
  @IsOptional()
  @IsEnum(SpaceObjectType)
  object_type?: SpaceObjectType;

  @ApiPropertyOptional({
    enum: SpaceObjectStatus,
    description: 'Filter by status',
  })
  @IsOptional()
  @IsEnum(SpaceObjectStatus)
  status?: SpaceObjectStatus;

  @ApiPropertyOptional({ enum: OrbitType, description: 'Filter by orbit type' })
  @IsOptional()
  @IsEnum(OrbitType)
  orbit_type?: OrbitType;

  @ApiPropertyOptional({ description: 'Filter by country' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Filter by operator' })
  @IsOptional()
  @IsString()
  operator?: string;
}
