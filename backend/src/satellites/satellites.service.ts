import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateSatelliteDto } from './dto/create-satellite.dto';
import { UpdateSatelliteDto } from './dto/update-satellite.dto';
import { QuerySatellitesDto } from './dto/query-satellites.dto';
import { PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class SatellitesService {
  private readonly logger = new Logger(SatellitesService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(query: QuerySatellitesDto): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc',
      norad_id,
      satellite_type,
      intl_code,
      space_object_id,
    } = query;
    const offset = (page - 1) * limit;

    let queryBuilder = this.supabaseService.client
      .from('satellites')
      .select('*, space_objects(*)', { count: 'exact' });

    if (norad_id) {
      queryBuilder = queryBuilder.eq('norad_id', norad_id);
    }
    if (satellite_type) {
      queryBuilder = queryBuilder.eq('satellite_type', satellite_type);
    }
    if (intl_code) {
      queryBuilder = queryBuilder.eq('intl_code', intl_code);
    }
    if (space_object_id) {
      queryBuilder = queryBuilder.eq('space_object_id', space_object_id);
    }

    const { data, error, count } = await queryBuilder
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      this.logger.error(`Error fetching satellites: ${error.message}`);
      throw error;
    }

    return new PaginatedResponse(data || [], count || 0, page, limit);
  }

  async findOne(id: string): Promise<any> {
    const { data, error } = await this.supabaseService.client
      .from('satellites')
      .select('*, space_objects(*)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.message?.includes('Cannot coerce') || error.code === 'PGRST116') {
        throw new NotFoundException(`Satellite with ID ${id} not found`);
      }
      this.logger.error(`Error fetching satellite: ${error.message}`);
      throw new NotFoundException(`Satellite with ID ${id} not found`);
    }

    return data;
  }

  async create(dto: CreateSatelliteDto): Promise<any> {
    const { data: spaceObject, error: soError } =
      await this.supabaseService.client
        .from('space_objects')
        .select('id')
        .eq('id', dto.space_object_id)
        .single();

    if (soError || !spaceObject) {
      throw new BadRequestException(
        `Space object with ID ${dto.space_object_id} not found`,
      );
    }

    const { data, error } = await this.supabaseService.client
      .from('satellites')
      .insert(dto)
      .select('*, space_objects(*)')
      .single();

    if (error) {
      this.logger.error(`Error creating satellite: ${error.message}`);
      throw error;
    }

    this.logger.log(`Created satellite: ${data.id}`);
    return data;
  }

  async update(id: string, dto: UpdateSatelliteDto): Promise<any> {
    const existing = await this.findOne(id);

    const { data, error } = await this.supabaseService.client
      .from('satellites')
      .update(dto)
      .eq('id', id)
      .select('*, space_objects(*)')
      .single();

    if (error) {
      this.logger.error(`Error updating satellite: ${error.message}`);
      throw error;
    }

    this.logger.log(`Updated satellite: ${data.id}`);
    return data;
  }
}
