import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { SupabaseRealtimeService } from './realtime.service';

@Global()
@Module({
  providers: [SupabaseService, SupabaseRealtimeService],
  exports: [SupabaseService, SupabaseRealtimeService],
})
export class SupabaseModule {}
