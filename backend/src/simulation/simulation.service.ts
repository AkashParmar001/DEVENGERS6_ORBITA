import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SimulationRunRequest {
  mission_id: string;
  robot_state: { position_km: number[]; velocity_kms: number[] };
  target_state: { position_km: number[]; velocity_kms: number[] };
  duration_seconds: number;
  time_scale?: number;
  time_step_seconds?: number;
}

export interface SimulationRunResponse {
  summary: Record<string, any>;
  telemetry: Record<string, any>[];
  events: Record<string, any>[];
}

@Injectable()
export class SimulationService {
  private readonly logger = new Logger(SimulationService.name);
  private baseUrl: string;

  constructor(private config: ConfigService) {
    const host = this.config.get<string>('INTELLIGENCE_HOST', 'localhost');
    const port = this.config.get<string>('INTELLIGENCE_PORT', '8000');
    this.baseUrl = `http://${host}:${port}`;
  }

  async runSimulation(
    req: SimulationRunRequest,
  ): Promise<SimulationRunResponse> {
    const resp = await fetch(`${this.baseUrl}/simulation/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal: AbortSignal.timeout(60_000),
    });

    if (!resp.ok) {
      const text = await resp.text();
      this.logger.error(`Simulation failed: ${resp.status} ${text}`);
      throw new Error(`Simulation service error: ${resp.status}`);
    }

    return resp.json() as Promise<SimulationRunResponse>;
  }
}
