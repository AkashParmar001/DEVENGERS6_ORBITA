import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

export interface RealtimeEvent {
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  schema: string;
  table: string;
  new?: Record<string, any>;
  old?: Record<string, any>;
  timestamp: string;
}

type RealtimeCallback = (event: RealtimeEvent) => void;

@Injectable()
export class SupabaseRealtimeService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseRealtimeService.name);
  private channel: any;
  private subscriptions: Map<string, RealtimeCallback[]> = new Map();

  constructor(private readonly supabaseService: SupabaseService) {}

  onModuleInit() {
    this.channel = this.supabaseService.client.channel('orbita-realtime');

    this.channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'missions' },
      (payload: any) => {
        const event: RealtimeEvent = {
          event: payload.eventType,
          schema: 'public',
          table: 'missions',
          new: payload.new,
          old: payload.old,
          timestamp: new Date().toISOString(),
        };
        this.dispatch(
          `mission.${this.mapEvent(payload.eventType, payload.new)}`,
          event,
        );
      },
    );

    this.channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'mission_events' },
      (payload: any) => {
        const event: RealtimeEvent = {
          event: payload.eventType,
          schema: 'public',
          table: 'mission_events',
          new: payload.new,
          old: payload.old,
          timestamp: new Date().toISOString(),
        };
        if (payload.new?.event_type) {
          this.dispatch(
            `mission.${this.mapMissionEvent(payload.new.event_type)}`,
            event,
          );
        }
      },
    );

    this.channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'telemetry' },
      (payload: any) => {
        const event: RealtimeEvent = {
          event: payload.eventType,
          schema: 'public',
          table: 'telemetry',
          new: payload.new,
          old: payload.old,
          timestamp: new Date().toISOString(),
        };
        this.dispatch('robot.telemetry.updated', event);
      },
    );

    this.channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orbital_states' },
      (payload: any) => {
        const event: RealtimeEvent = {
          event: payload.eventType,
          schema: 'public',
          table: 'orbital_states',
          new: payload.new,
          old: payload.old,
          timestamp: new Date().toISOString(),
        };
        this.dispatch('object.position.updated', event);
      },
    );

    this.channel.subscribe((status: string) => {
      this.logger.log(`Realtime channel status: ${status}`);
    });
  }

  subscribe(channel: string, callback: RealtimeCallback): () => void {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, []);
    }
    this.subscriptions.get(channel)!.push(callback);

    return () => {
      const cbs = this.subscriptions.get(channel);
      if (cbs) {
        const idx = cbs.indexOf(callback);
        if (idx > -1) cbs.splice(idx, 1);
      }
    };
  }

  getChannels(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  private dispatch(channel: string, event: RealtimeEvent) {
    const cbs = this.subscriptions.get(channel);
    if (cbs && cbs.length > 0) {
      cbs.forEach((cb) => {
        try {
          cb(event);
        } catch (err) {
          this.logger.error(`Realtime callback error on ${channel}: ${err}`);
        }
      });
    }
    this.logger.log(
      JSON.stringify({
        realtime: channel,
        event: event.event,
        table: event.table,
      }),
    );
  }

  private mapEvent(eventType: string, newRecord?: any): string {
    if (eventType === 'INSERT') return 'created';
    if (eventType === 'DELETE') return 'deleted';
    if (eventType === 'UPDATE' && newRecord?.status) {
      return this.mapMissionStatus(newRecord.status);
    }
    return 'updated';
  }

  private mapMissionStatus(status: string): string {
    const map: Record<string, string> = {
      SIMULATING: 'started',
      PAUSED: 'paused',
      COMPLETED: 'completed',
      FAILED: 'failed',
      ABORTED: 'failed',
    };
    return map[status] || 'updated';
  }

  private mapMissionEvent(eventType: string): string {
    const map: Record<string, string> = {
      MISSION_CREATED: 'created',
      MISSION_COMPLETED: 'completed',
      MISSION_FAILED: 'failed',
      MISSION_ABORTED: 'failed',
      SIMULATION_STARTED: 'started',
      SIMULATION_PAUSED: 'paused',
      ANOMALY_DETECTED: 'anomaly',
    };
    return map[eventType] || 'updated';
  }
}
