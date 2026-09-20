import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MissionEventsService } from './mission-events.service';
import { UuidParamDto } from '../common/dto/uuid.dto';

@ApiTags('Mission Events')
@Controller('mission-events')
export class MissionEventsController {
  constructor(private readonly missionEventsService: MissionEventsService) {}

  @Get(':missionId')
  @ApiOperation({ summary: 'Get events for a mission' })
  @ApiParam({ name: 'missionId', format: 'uuid' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Mission events' })
  async findByMission(
    @Param() params: UuidParamDto,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.missionEventsService.findByMission(
      params.id,
      page || 1,
      limit || 50,
    );
  }

  @Get('single/:id')
  @ApiOperation({ summary: 'Get a single mission event' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Mission event details' })
  async findOne(@Param() params: UuidParamDto) {
    return this.missionEventsService.findOne(params.id);
  }
}
