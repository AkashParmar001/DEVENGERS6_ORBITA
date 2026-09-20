import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SupabaseRealtimeService } from '../supabase/realtime.service';
import { SupabaseService } from '../supabase/supabase.service';

@ApiTags('Realtime')
@Controller('realtime')
export class RealtimeController {
  constructor(
    private readonly realtimeService: SupabaseRealtimeService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get('channels')
  @ApiOperation({
    summary: 'List available Realtime channels',
    description:
      'Returns the list of Supabase Realtime channels the backend subscribes to. ' +
      'The frontend should use the Supabase JS client to subscribe to these channels directly.',
  })
  @ApiResponse({ status: 200, description: 'Available realtime channels' })
  getChannels() {
    return {
      data: {
        channels: [
          {
            name: 'mission.created',
            description: 'Emitted when a new mission is created',
            table: 'missions',
            event: 'INSERT',
          },
          {
            name: 'mission.updated',
            description: 'Emitted when a mission is updated',
            table: 'missions',
            event: 'UPDATE',
          },
          {
            name: 'mission.started',
            description: 'Emitted when a mission enters SIMULATING state',
            table: 'missions',
            event: 'UPDATE',
          },
          {
            name: 'mission.paused',
            description: 'Emitted when a mission is paused',
            table: 'missions',
            event: 'UPDATE',
          },
          {
            name: 'mission.completed',
            description: 'Emitted when a mission completes successfully',
            table: 'missions',
            event: 'UPDATE',
          },
          {
            name: 'mission.failed',
            description: 'Emitted when a mission fails or is aborted',
            table: 'missions',
            event: 'UPDATE',
          },
          {
            name: 'robot.telemetry.updated',
            description:
              'Emitted when new telemetry data is recorded for a robot',
            table: 'telemetry',
            event: 'INSERT',
          },
          {
            name: 'object.position.updated',
            description: 'Emitted when orbital state vectors are updated',
            table: 'orbital_states',
            event: 'INSERT',
          },
          {
            name: 'risk.updated',
            description:
              'Emitted when risk assessment changes (via mission_events)',
            table: 'mission_events',
            event: 'INSERT',
          },
          {
            name: 'anomaly.detected',
            description:
              'Emitted when an anomaly is detected during simulation',
            table: 'mission_events',
            event: 'INSERT',
          },
        ],
        supabaseUrl:
          (this.supabaseService.client as any).supabaseUrl || 'configured',
        instructions:
          'Use the Supabase JS client to subscribe: ' +
          "supabase.channel('orbita').on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, callback).subscribe()",
      },
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Get Realtime connection status' })
  @ApiResponse({ status: 200, description: 'Realtime status' })
  getStatus() {
    return {
      data: {
        status: 'active',
        transport: 'websocket',
        provider: 'supabase',
        subscribedTables: [
          'missions',
          'mission_events',
          'telemetry',
          'orbital_states',
        ],
      },
    };
  }
}
