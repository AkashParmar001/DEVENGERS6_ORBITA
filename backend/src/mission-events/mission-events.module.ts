import { Module } from '@nestjs/common';
import { MissionEventsController } from './mission-events.controller';
import { MissionEventsService } from './mission-events.service';

@Module({
  controllers: [MissionEventsController],
  providers: [MissionEventsService],
  exports: [MissionEventsService],
})
export class MissionEventsModule {}
