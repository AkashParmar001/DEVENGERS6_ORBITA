import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MissionsService } from './missions.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { QueryMissionsDto } from './dto/query-missions.dto';
import { UuidParamDto } from '../common/dto/uuid.dto';

@ApiTags('Missions')
@Controller('missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all missions with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'List of missions' })
  async findAll(@Query() query: QueryMissionsDto) {
    return this.missionsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a mission by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Mission details' })
  @ApiResponse({ status: 404, description: 'Mission not found' })
  async findOne(@Param() params: UuidParamDto) {
    return this.missionsService.findOne(params.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new mission' })
  @ApiResponse({ status: 201, description: 'Mission created' })
  async create(@Body() dto: CreateMissionDto) {
    return this.missionsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a mission' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Mission updated' })
  @ApiResponse({ status: 404, description: 'Mission not found' })
  async update(@Param() params: UuidParamDto, @Body() dto: UpdateMissionDto) {
    return this.missionsService.update(params.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a mission' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Mission deleted' })
  @ApiResponse({ status: 404, description: 'Mission not found' })
  async remove(@Param() params: UuidParamDto) {
    await this.missionsService.remove(params.id);
  }

  @Post(':id/plan')
  @ApiOperation({ summary: 'Transition mission to PLANNING' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Mission transitioned to PLANNING' })
  @ApiResponse({ status: 409, description: 'Invalid state transition' })
  async plan(@Param() params: UuidParamDto) {
    return this.missionsService.plan(params.id);
  }

  @Post(':id/validate')
  @ApiOperation({ summary: 'Transition mission to VALIDATING' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Mission transitioned to VALIDATING',
  })
  @ApiResponse({ status: 409, description: 'Invalid state transition' })
  async validate(@Param() params: UuidParamDto) {
    return this.missionsService.validate(params.id);
  }

  @Post(':id/ready')
  @ApiOperation({ summary: 'Transition mission to READY' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Mission transitioned to READY' })
  @ApiResponse({ status: 409, description: 'Invalid state transition' })
  async ready(@Param() params: UuidParamDto) {
    return this.missionsService.ready(params.id);
  }

  @Post(':id/simulate')
  @ApiOperation({ summary: 'Transition mission to SIMULATING' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Mission transitioned to SIMULATING',
  })
  @ApiResponse({ status: 409, description: 'Invalid state transition' })
  async simulate(@Param() params: UuidParamDto) {
    return this.missionsService.simulate(params.id);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Transition mission to PAUSED' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Mission transitioned to PAUSED' })
  @ApiResponse({ status: 409, description: 'Invalid state transition' })
  async pause(@Param() params: UuidParamDto) {
    return this.missionsService.pause(params.id);
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume mission from PAUSED to SIMULATING' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Mission resumed to SIMULATING' })
  @ApiResponse({ status: 409, description: 'Invalid state transition' })
  async resume(@Param() params: UuidParamDto) {
    return this.missionsService.resume(params.id);
  }

  @Post(':id/abort')
  @ApiOperation({ summary: 'Abort mission' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Mission abort initiated' })
  @ApiResponse({ status: 409, description: 'Invalid state transition' })
  async abort(@Param() params: UuidParamDto) {
    return this.missionsService.abort(params.id);
  }

  @Get(':id/events')
  @ApiOperation({ summary: 'Get all events for a mission' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Mission events' })
  async getEvents(@Param() params: UuidParamDto) {
    return this.missionsService.getEvents(params.id);
  }

  @Get(':id/report')
  @ApiOperation({ summary: 'Get the latest report for a mission' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Mission report' })
  async getReport(@Param() params: UuidParamDto) {
    return this.missionsService.getReport(params.id);
  }
}
