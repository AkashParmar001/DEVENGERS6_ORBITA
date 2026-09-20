import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  TrajectoryPlanRequestDto,
  TrajectoryPlanResponseDto,
  CollisionRiskRequestDto,
  CollisionRiskResponseDto,
  IntelligenceHealthDto,
} from './dto/intelligence.dto';

@Injectable()
export class IntelligenceService implements OnModuleInit {
  private readonly logger = new Logger(IntelligenceService.name);
  private baseUrl: string;
  private readonly timeout = 10_000;

  constructor(private config: ConfigService) {
    const host = this.config.get<string>('INTELLIGENCE_HOST', 'localhost');
    const port = this.config.get<string>('INTELLIGENCE_PORT', '8000');
    this.baseUrl = `http://${host}:${port}`;
  }

  onModuleInit() {
    this.logger.log(`Intelligence client pointing to ${this.baseUrl}`);
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!resp.ok) {
        const text = await resp.text();
        this.logger.error(
          `Intelligence ${method} ${path} failed: ${resp.status} ${text}`,
        );
        throw new Error(`Intelligence service error: ${resp.status} ${text}`);
      }

      return (await resp.json()) as T;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        this.logger.error(`Intelligence ${method} ${path} timed out`);
        throw new Error('Intelligence service timeout');
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  async health(): Promise<IntelligenceHealthDto> {
    return this.request<IntelligenceHealthDto>('GET', '/health');
  }

  async planTrajectory(
    req: TrajectoryPlanRequestDto,
  ): Promise<TrajectoryPlanResponseDto> {
    return this.request<TrajectoryPlanResponseDto>(
      'POST',
      '/trajectory/plan',
      req,
    );
  }

  async assessCollisionRisk(
    req: CollisionRiskRequestDto,
  ): Promise<CollisionRiskResponseDto> {
    return this.request<CollisionRiskResponseDto>(
      'POST',
      '/risk/collision',
      req,
    );
  }
}
