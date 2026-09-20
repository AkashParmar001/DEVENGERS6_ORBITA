import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { QueryOrbitalStatesDto } from './dto/query-orbital-states.dto';
import { PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class OrbitalStatesService {
  private readonly logger = new Logger(OrbitalStatesService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findByObject(
    objectId: string,
    query: QueryOrbitalStatesDto,
  ): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'timestamp',
      sortOrder = 'desc',
      after,
      before,
    } = query;
    const offset = (page - 1) * limit;

    let queryBuilder = this.supabaseService.client
      .from('orbital_states')
      .select('*', { count: 'exact' })
      .eq('space_object_id', objectId);

    if (after) {
      queryBuilder = queryBuilder.gte('timestamp', after);
    }
    if (before) {
      queryBuilder = queryBuilder.lte('timestamp', before);
    }

    const { data, error, count } = await queryBuilder
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      this.logger.error(`Error fetching orbital states: ${error.message}`);
      throw error;
    }

    return new PaginatedResponse(data || [], count || 0, page, limit);
  }
}
