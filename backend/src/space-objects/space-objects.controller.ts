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
import { SpaceObjectsService } from './space-objects.service';
import { CreateSpaceObjectDto } from './dto/create-space-object.dto';
import { UpdateSpaceObjectDto } from './dto/update-space-object.dto';
import { QuerySpaceObjectsDto } from './dto/query-space-objects.dto';
import { UuidParamDto } from '../common/dto/uuid.dto';

@ApiTags('Space Objects')
@Controller('space-objects')
export class SpaceObjectsController {
  constructor(private readonly spaceObjectsService: SpaceObjectsService) {}

  @Get()
  @ApiOperation({
    summary: 'List all space objects with pagination and filtering',
  })
  @ApiResponse({ status: 200, description: 'List of space objects' })
  async findAll(@Query() query: QuerySpaceObjectsDto) {
    return this.spaceObjectsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a space object by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Space object details' })
  @ApiResponse({ status: 404, description: 'Space object not found' })
  async findOne(@Param() params: UuidParamDto) {
    return this.spaceObjectsService.findOne(params.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new space object' })
  @ApiResponse({ status: 201, description: 'Space object created' })
  async create(@Body() dto: CreateSpaceObjectDto) {
    return this.spaceObjectsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a space object' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Space object updated' })
  @ApiResponse({ status: 404, description: 'Space object not found' })
  async update(
    @Param() params: UuidParamDto,
    @Body() dto: UpdateSpaceObjectDto,
  ) {
    return this.spaceObjectsService.update(params.id, dto);
  }
}
