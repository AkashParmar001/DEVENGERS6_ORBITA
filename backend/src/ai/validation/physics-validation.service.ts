import { Injectable, Logger } from '@nestjs/common';
import type { MissionPlanResponse } from '../ai.types';
import type { ValidationResult } from './validation.types';

@Injectable()
export class PhysicsValidationService {
  private readonly logger = new Logger(PhysicsValidationService.name);

  async validate(plan: MissionPlanResponse): Promise<ValidationResult> {
    this.logger.log(
      `Running physics validation for plan: ${plan.mission_name}`,
    );

    return {
      status: 'NOT_IMPLEMENTED',
      details: [
        'Physics validation requires Python intelligence service integration.',
        'Trajectory feasibility, delta-v budget, and orbital mechanics constraints cannot be validated without the intelligence service.',
        'Connect to the Python intelligence service at the configured INTELLIGENCE_HOST:INTELLIGENCE_PORT to enable physics validation.',
      ],
    };
  }
}
