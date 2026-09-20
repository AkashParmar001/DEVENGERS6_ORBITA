import { PartialType } from '@nestjs/swagger';
import { CreateRobotDto } from './create-robot.dto';

export class UpdateRobotDto extends PartialType(CreateRobotDto) {}
