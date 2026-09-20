import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from '../supabase/supabase.module';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ValidationModule } from './validation/validation.module';

@Module({
  imports: [ConfigModule, SupabaseModule, ValidationModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
