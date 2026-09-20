import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async checkHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  async checkReady(): Promise<{ status: string; database: string }> {
    try {
      const { error } = await this.supabaseService.client
        .from('users')
        .select('id')
        .limit(1);

      if (error) {
        this.logger.warn(`Database readiness check failed: ${error.message}`);
        return {
          status: 'not_ready',
          database: 'unavailable',
        };
      }

      return {
        status: 'ok',
        database: 'connected',
      };
    } catch (error) {
      this.logger.error('Readiness check error', error);
      return {
        status: 'not_ready',
        database: 'error',
      };
    }
  }
}
