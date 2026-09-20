import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RobotType } from './create-robot.dto';

export class QueryRobotsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: RobotType, description: 'Filter by robot type' })
  @IsOptional()
  @IsEnum(RobotType)
  robot_type?: RobotType;

  @ApiPropertyOptional({ description: 'Filter by manufacturer' })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({ description: 'Filter by space object ID' })
  @IsOptional()
  @IsString()
  space_object_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by minimum autonomy level',
    minimum: 0,
    maximum: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  min_autonomy_level?: number;
}
