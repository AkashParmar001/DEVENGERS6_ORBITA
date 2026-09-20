import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryTelemetryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by metric type' })
  @IsOptional()
  @IsString()
  metric_type?: string;

  @ApiPropertyOptional({
    description: 'Filter after this timestamp (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  after?: string;

  @ApiPropertyOptional({
    description: 'Filter before this timestamp (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  before?: string;
}
