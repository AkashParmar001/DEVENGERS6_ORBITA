import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateSpaceObjectDto } from './dto/create-space-object.dto';
import { UpdateSpaceObjectDto } from './dto/update-space-object.dto';
import { QuerySpaceObjectsDto } from './dto/query-space-objects.dto';
import { PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class SpaceObjectsService {
  private readonly logger = new Logger(SpaceObjectsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(query: QuerySpaceObjectsDto): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc',
      name,
      object_type,
      status,
      orbit_type,
      country,
      operator,
    } = query;
    const offset = (page - 1) * limit;

    let queryBuilder = this.supabaseService.client
      .from('space_objects')
      .select('*', { count: 'exact' });

    if (name) {
      queryBuilder = queryBuilder.ilike('name', `%${name}%`);
    }
    if (object_type) {
      queryBuilder = queryBuilder.eq('object_type', object_type);
    }
    if (status) {
      queryBuilder = queryBuilder.eq('status', status);
    }
    if (orbit_type) {
      queryBuilder = queryBuilder.eq('orbit_type', orbit_type);
    }
    if (country) {
      queryBuilder = queryBuilder.ilike('country', `%${country}%`);
    }
    if (operator) {
      queryBuilder = queryBuilder.ilike('operator', `%${operator}%`);
    }

    const { data, error, count } = await queryBuilder
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      this.logger.error(`Error fetching space objects: ${error.message}`);
      throw error;
    }

    return new PaginatedResponse(data || [], count || 0, page, limit);
  }

  async findOne(id: string): Promise<any> {
    const { data, error } = await this.supabaseService.client
      .from('space_objects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (
        error.message?.includes('Cannot coerce') ||
        error.code === 'PGRST116'
      ) {
        throw new NotFoundException(`Space object with ID ${id} not found`);
      }
      this.logger.error(`Error fetching space object: ${error.message}`);
      throw new NotFoundException(`Space object with ID ${id} not found`);
    }

    return data;
  }

  async create(dto: CreateSpaceObjectDto): Promise<any> {
    const { data, error } = await this.supabaseService.client
      .from('space_objects')
      .insert(dto)
      .select()
      .single();

    if (error) {
      this.logger.error(`Error creating space object: ${error.message}`);
      throw error;
    }

    this.logger.log(`Created space object: ${data.id} (${data.name})`);
    return data;
  }

  async update(id: string, dto: UpdateSpaceObjectDto): Promise<any> {
    const existing = await this.findOne(id);

    const { data, error } = await this.supabaseService.client
      .from('space_objects')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error(`Error updating space object: ${error.message}`);
      throw error;
    }

    this.logger.log(`Updated space object: ${data.id} (${data.name})`);
    return data;
  }
}
