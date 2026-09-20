import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateRobotDto } from './dto/create-robot.dto';
import { UpdateRobotDto } from './dto/update-robot.dto';
import { QueryRobotsDto } from './dto/query-robots.dto';
import { PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class RobotsService {
  private readonly logger = new Logger(RobotsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(query: QueryRobotsDto): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc',
      robot_type,
      manufacturer,
      space_object_id,
      min_autonomy_level,
    } = query;
    const offset = (page - 1) * limit;

    let queryBuilder = this.supabaseService.client
      .from('robots')
      .select('*, space_objects(*)', { count: 'exact' });

    if (robot_type) {
      queryBuilder = queryBuilder.eq('robot_type', robot_type);
    }
    if (manufacturer) {
      queryBuilder = queryBuilder.ilike('manufacturer', `%${manufacturer}%`);
    }
    if (space_object_id) {
      queryBuilder = queryBuilder.eq('space_object_id', space_object_id);
    }
    if (min_autonomy_level !== undefined) {
      queryBuilder = queryBuilder.gte('autonomy_level', min_autonomy_level);
    }

    const { data, error, count } = await queryBuilder
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      this.logger.error(`Error fetching robots: ${error.message}`);
      throw error;
    }

    return new PaginatedResponse(data || [], count || 0, page, limit);
  }

  async findOne(id: string): Promise<any> {
    const { data, error } = await this.supabaseService.client
      .from('robots')
      .select('*, space_objects(*)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.message?.includes('Cannot coerce') || error.code === 'PGRST116') {
        throw new NotFoundException(`Robot with ID ${id} not found`);
      }
      this.logger.error(`Error fetching robot: ${error.message}`);
      throw new NotFoundException(`Robot with ID ${id} not found`);
    }

    return data;
  }

  async create(dto: CreateRobotDto): Promise<any> {
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
      .from('robots')
      .insert(dto)
      .select('*, space_objects(*)')
      .single();

    if (error) {
      this.logger.error(`Error creating robot: ${error.message}`);
      throw error;
    }

    this.logger.log(`Created robot: ${data.id}`);
    return data;
  }

  async update(id: string, dto: UpdateRobotDto): Promise<any> {
    const existing = await this.findOne(id);

    const { data, error } = await this.supabaseService.client
      .from('robots')
      .update(dto)
      .eq('id', id)
      .select('*, space_objects(*)')
      .single();

    if (error) {
      this.logger.error(`Error updating robot: ${error.message}`);
      throw error;
    }

    this.logger.log(`Updated robot: ${data.id}`);
    return data;
  }
}
