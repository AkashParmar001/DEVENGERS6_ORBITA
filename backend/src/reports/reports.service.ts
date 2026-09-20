import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { PaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(page = 1, limit = 20): Promise<PaginatedResponse<any>> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await this.supabaseService.client
      .from('reports')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      this.logger.error(`Error fetching reports: ${error.message}`);
      throw error;
    }

    return new PaginatedResponse(data || [], count || 0, page, limit);
  }

  async findOne(id: string): Promise<any> {
    const { data, error } = await this.supabaseService.client
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.message?.includes('Cannot coerce') || error.code === 'PGRST116') {
        throw new NotFoundException(`Report with ID ${id} not found`);
      }
      this.logger.error(`Error fetching report: ${error.message}`);
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return data;
  }

  async create(
    missionId: string,
    title: string,
    reportType: string,
    content: Record<string, any>,
    generatedBy?: string,
  ): Promise<any> {
    const { data, error } = await this.supabaseService.client
      .from('reports')
      .insert({
        mission_id: missionId,
        title,
        report_type: reportType || 'status',
        content: content || {},
        generated_by: generatedBy || null,
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`Error creating report: ${error.message}`);
      throw error;
    }

    this.logger.log(`Created report: ${data.id}`);
    return data;
  }
}
