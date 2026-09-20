import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { OrbitalStatesService } from './orbital-states.service';
import { QueryOrbitalStatesDto } from './dto/query-orbital-states.dto';
import { UuidParamDto } from '../common/dto/uuid.dto';

@ApiTags('Orbital States')
@Controller('orbital-states')
export class OrbitalStatesController {
  constructor(private readonly orbitalStatesService: OrbitalStatesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get orbital state vectors for a space object' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Space object ID' })
  @ApiResponse({
    status: 200,
    description: 'Orbital state data with position and velocity vectors',
  })
  async findByObject(
    @Param() params: UuidParamDto,
    @Query() query: QueryOrbitalStatesDto,
  ) {
    return this.orbitalStatesService.findByObject(params.id, query);
  }
}
