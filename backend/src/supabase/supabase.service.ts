import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const url = this.configService.get<string>('SUPABASE_URL');
    const serviceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );
    const anonKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    const apiKey =
      serviceRoleKey &&
      serviceRoleKey !== 'your-service-role-key-from-supabase-dashboard'
        ? serviceRoleKey
        : anonKey;

    if (!url || !apiKey) {
      this.logger.error('Missing SUPABASE_URL or API key');
      throw new Error('Supabase configuration is missing');
    }

    this.supabase = createClient(url, apiKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const usingServiceRole =
      serviceRoleKey &&
      serviceRoleKey !== 'your-service-role-key-from-supabase-dashboard';
    this.logger.log(
      `Supabase client initialized with ${usingServiceRole ? 'service role key' : 'anon key (fallback)'}`,
    );
  }

  get client(): SupabaseClient {
    return this.supabase;
  }
}
