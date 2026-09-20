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

export enum RobotType {
  ROVER = 'rover',
  ARM = 'arm',
  DRONE = 'drone',
  ASSEMBLY = 'assembly',
  REPAIR = 'repair',
}

export class CreateRobotDto {
  @ApiProperty({ format: 'uuid', description: 'ID of the parent space object' })
  @Matches(UUID_REGEX, { message: 'space_object_id must be a valid UUID' })
  @IsNotEmpty()
  space_object_id: string;

  @ApiPropertyOptional({ enum: RobotType, example: RobotType.ROVER })
  @IsOptional()
  @IsEnum(RobotType)
  robot_type?: RobotType;

  @ApiPropertyOptional({ example: 'SpaceX' })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional({ example: 3, minimum: 0, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  autonomy_level?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  payload_capacity_kg?: number;
}
