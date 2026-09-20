import { PartialType } from '@nestjs/swagger';
import { CreateSatelliteDto } from './create-satellite.dto';

export class UpdateSatelliteDto extends PartialType(CreateSatelliteDto) {}
