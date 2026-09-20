import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TelemetryService } from './telemetry.service';
import { QueryTelemetryDto } from './dto/query-telemetry.dto';
import { UuidParamDto } from '../common/dto/uuid.dto';

@ApiTags('Telemetry')
@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get telemetry data for a space object' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Space object ID' })
  @ApiResponse({ status: 200, description: 'Telemetry data' })
  async findByObject(
    @Param() params: UuidParamDto,
    @Query() query: QueryTelemetryDto,
  ) {
    return this.telemetryService.findByObject(params.id, query);
  }
}
