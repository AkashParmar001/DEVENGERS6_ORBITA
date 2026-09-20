import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { QueryTelemetryDto } from './dto/query-telemetry.dto';
import { PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findByObject(
    objectId: string,
    query: QueryTelemetryDto,
  ): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'timestamp',
      sortOrder = 'desc',
      metric_type,
      after,
      before,
    } = query;
    const offset = (page - 1) * limit;

    let queryBuilder = this.supabaseService.client
      .from('telemetry')
      .select('*', { count: 'exact' })
      .eq('space_object_id', objectId);

    if (metric_type) {
      queryBuilder = queryBuilder.eq('metric_type', metric_type);
    }
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
      this.logger.error(`Error fetching telemetry: ${error.message}`);
      throw error;
    }

    return new PaginatedResponse(data || [], count || 0, page, limit);
  }
}
