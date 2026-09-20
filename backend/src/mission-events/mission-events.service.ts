import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class MissionEventsService {
  private readonly logger = new Logger(MissionEventsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findByMission(
    missionId: string,
    page = 1,
    limit = 50,
  ): Promise<PaginatedResponse<any>> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await this.supabaseService.client
      .from('mission_events')
      .select('*', { count: 'exact' })
      .eq('mission_id', missionId)
      .order('timestamp', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      this.logger.error(`Error fetching mission events: ${error.message}`);
      throw error;
    }

    return new PaginatedResponse(data || [], count || 0, page, limit);
  }

  async findOne(id: string): Promise<any> {
    const { data, error } = await this.supabaseService.client
      .from('mission_events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.message?.includes('Cannot coerce') || error.code === 'PGRST116') {
        throw new NotFoundException(`Mission event with ID ${id} not found`);
      }
      this.logger.error(`Error fetching mission event: ${error.message}`);
      throw new NotFoundException(`Mission event with ID ${id} not found`);
    }

    return data;
  }
}
