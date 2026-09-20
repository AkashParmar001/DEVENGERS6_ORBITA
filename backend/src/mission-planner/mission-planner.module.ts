import { Module } from '@nestjs/common';
import { MissionPlannerController } from './mission-planner.controller';
import { MissionPlannerService } from './mission-planner.service';
import { ToolExecutor } from '../ai/tools/tool-executor';
import { SupabaseModule } from '../supabase/supabase.module';
import { IntelligenceModule } from '../intelligence/intelligence.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [SupabaseModule, IntelligenceModule, AiModule],
  controllers: [MissionPlannerController],
  providers: [MissionPlannerService, ToolExecutor],
  exports: [MissionPlannerService],
})
export class MissionPlannerModule {}
