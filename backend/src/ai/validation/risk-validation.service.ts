import { Injectable, Logger } from '@nestjs/common';
import type { MissionPlanResponse } from '../ai.types';
import type { ValidationResult } from './validation.types';

@Injectable()
export class RiskValidationService {
  private readonly logger = new Logger(RiskValidationService.name);

  async validate(
    plan: MissionPlanResponse,
    riskMetrics?: unknown,
  ): Promise<ValidationResult> {
    this.logger.log(`Running risk validation for plan: ${plan.mission_name}`);

    if (!riskMetrics) {
      return {
        status: 'PENDING',
        details: [
          'No risk metrics provided. Risk validation cannot be completed until collision risk assessment is performed.',
          'Call the intelligence service /risk/collision endpoint first.',
        ],
      };
    }

    const metrics = riskMetrics as Record<string, unknown>;

    const details: string[] = [];
    let failed = false;

    if (typeof metrics.probability === 'number') {
      if (metrics.probability > plan.constraints.max_collision_probability) {
        failed = true;
        details.push(
          `Collision probability ${metrics.probability} exceeds max allowed ${plan.constraints.max_collision_probability}.`,
        );
      } else {
        details.push(
          `Collision probability ${metrics.probability} is within bounds.`,
        );
      }
    } else {
      details.push('Collision probability not found in risk metrics.');
    }

    if (typeof metrics.minimum_distance_km === 'number') {
      if (metrics.minimum_distance_km < plan.constraints.min_safe_distance_km) {
        failed = true;
        details.push(
          `Minimum distance ${metrics.minimum_distance_km} km is below safe threshold ${plan.constraints.min_safe_distance_km} km.`,
        );
      } else {
        details.push(
          `Minimum distance ${metrics.minimum_distance_km} km is above safe threshold.`,
        );
      }
    } else {
      details.push('Minimum distance not found in risk metrics.');
    }

    return {
      status: failed ? 'FAILED' : 'PASSED',
      details,
    };
  }
}
