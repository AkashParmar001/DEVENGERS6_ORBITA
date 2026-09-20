import { Module } from '@nestjs/common';
import { TelemetryController } from './telemetry.controller';
import { OrbitalStatesController } from './orbital-states.controller';
import { TelemetryService } from './telemetry.service';
import { OrbitalStatesService } from './orbital-states.service';

@Module({
  controllers: [TelemetryController, OrbitalStatesController],
  providers: [TelemetryService, OrbitalStatesService],
  exports: [TelemetryService, OrbitalStatesService],
})
export class TelemetryModule {}
