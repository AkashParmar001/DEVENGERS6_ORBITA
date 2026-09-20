import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SatellitesService } from './satellites.service';
import { CreateSatelliteDto } from './dto/create-satellite.dto';
import { UpdateSatelliteDto } from './dto/update-satellite.dto';
import { QuerySatellitesDto } from './dto/query-satellites.dto';
import { UuidParamDto } from '../common/dto/uuid.dto';

@ApiTags('Satellites')
@Controller('satellites')
export class SatellitesController {
  constructor(private readonly satellitesService: SatellitesService) {}

  @Get()
  @ApiOperation({
    summary: 'List all satellites with pagination and filtering',
  })
  @ApiResponse({ status: 200, description: 'List of satellites' })
  async findAll(@Query() query: QuerySatellitesDto) {
    return this.satellitesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a satellite by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Satellite details' })
  @ApiResponse({ status: 404, description: 'Satellite not found' })
  async findOne(@Param() params: UuidParamDto) {
    return this.satellitesService.findOne(params.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new satellite' })
  @ApiResponse({ status: 201, description: 'Satellite created' })
  async create(@Body() dto: CreateSatelliteDto) {
    return this.satellitesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a satellite' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Satellite updated' })
  @ApiResponse({ status: 404, description: 'Satellite not found' })
  async update(@Param() params: UuidParamDto, @Body() dto: UpdateSatelliteDto) {
    return this.satellitesService.update(params.id, dto);
  }
}
