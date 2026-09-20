import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { validate } from './config/validation';
import { SupabaseModule } from './supabase/supabase.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MissionsModule } from './missions/missions.module';
import { SpaceObjectsModule } from './space-objects/space-objects.module';
import { SatellitesModule } from './satellites/satellites.module';
import { RobotsModule } from './robots/robots.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { MissionEventsModule } from './mission-events/mission-events.module';
import { ReportsModule } from './reports/reports.module';
import { RealtimeModule } from './realtime/realtime.module';
import { IntelligenceModule } from './intelligence/intelligence.module';
import { MissionPlannerModule } from './mission-planner/mission-planner.module';
import { SimulationModule } from './simulation/simulation.module';
import { AiModule } from './ai/ai.module';
import { ValidationModule } from './ai/validation/validation.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    SupabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    MissionsModule,
    SpaceObjectsModule,
    SatellitesModule,
    RobotsModule,
    TelemetryModule,
    MissionEventsModule,
    ReportsModule,
    RealtimeModule,
    IntelligenceModule,
    MissionPlannerModule,
    SimulationModule,
    AiModule,
    ValidationModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
