import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { MissionStatus } from './create-mission.dto';

export class QueryMissionsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by mission name (partial match)',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    enum: MissionStatus,
    description: 'Filter by mission status',
  })
  @IsOptional()
  @IsEnum(MissionStatus)
  status?: MissionStatus;

  @ApiPropertyOptional({ format: 'uuid', description: 'Filter by target ID' })
  @IsOptional()
  @IsString()
  target_id?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Filter by robot ID' })
  @IsOptional()
  @IsString()
  robot_id?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Filter by creator user ID',
  })
  @IsOptional()
  @IsString()
  created_by?: string;
}
