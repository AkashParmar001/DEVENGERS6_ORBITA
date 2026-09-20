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
import { RobotsService } from './robots.service';
import { CreateRobotDto } from './dto/create-robot.dto';
import { UpdateRobotDto } from './dto/update-robot.dto';
import { QueryRobotsDto } from './dto/query-robots.dto';
import { UuidParamDto } from '../common/dto/uuid.dto';

@ApiTags('Robots')
@Controller('robots')
export class RobotsController {
  constructor(private readonly robotsService: RobotsService) {}

  @Get()
  @ApiOperation({ summary: 'List all robots with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'List of robots' })
  async findAll(@Query() query: QueryRobotsDto) {
    return this.robotsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a robot by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Robot details' })
  @ApiResponse({ status: 404, description: 'Robot not found' })
  async findOne(@Param() params: UuidParamDto) {
    return this.robotsService.findOne(params.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new robot' })
  @ApiResponse({ status: 201, description: 'Robot created' })
  async create(@Body() dto: CreateRobotDto) {
    return this.robotsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a robot' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Robot updated' })
  @ApiResponse({ status: 404, description: 'Robot not found' })
  async update(@Param() params: UuidParamDto, @Body() dto: UpdateRobotDto) {
    return this.robotsService.update(params.id, dto);
  }
}
