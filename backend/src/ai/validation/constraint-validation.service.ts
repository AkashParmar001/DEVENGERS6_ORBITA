import { Injectable, Logger } from '@nestjs/common';
import type { MissionPlanResponse } from '../ai.types';
import type { ValidationResult } from './validation.types';

@Injectable()
export class ConstraintValidationService {
  private readonly logger = new Logger(ConstraintValidationService.name);

  validate(plan: MissionPlanResponse): ValidationResult {
    this.logger.log(
      `Running constraint validation for plan: ${plan.mission_name}`,
    );

    const details: string[] = [];
    let failed = false;

    // Validate constraints are within bounds
    if (plan.constraints.max_delta_v_ms <= 0) {
      failed = true;
      details.push('max_delta_v_ms must be positive.');
    }

    if (plan.constraints.max_duration_seconds <= 0) {
      failed = true;
      details.push('max_duration_seconds must be positive.');
    }

    if (plan.constraints.min_safe_distance_km <= 0) {
      failed = true;
      details.push('min_safe_distance_km must be positive.');
    }

    if (
      plan.constraints.max_collision_probability < 0 ||
      plan.constraints.max_collision_probability > 1
    ) {
      failed = true;
      details.push('max_collision_probability must be between 0 and 1.');
    }

    // Validate required validation list is present
    if (!plan.required_validation || plan.required_validation.length === 0) {
      failed = true;
      details.push(
        'required_validation must list at least one validation type.',
      );
    } else {
      details.push(
        `Required validations defined: ${plan.required_validation.join(', ')}.`,
      );
    }

    // Validate success conditions are defined
    if (!plan.success_conditions || plan.success_conditions.length === 0) {
      failed = true;
      details.push('success_conditions must define at least one condition.');
    } else {
      details.push(
        `Success conditions defined: ${plan.success_conditions.length} condition(s).`,
      );
    }

    // Validate tasks are present
    if (!plan.tasks || plan.tasks.length === 0) {
      failed = true;
      details.push('Mission must have at least one task.');
    } else {
      details.push(`Mission has ${plan.tasks.length} task(s).`);

      // Validate task dependencies reference valid task IDs
      const taskIds = new Set(plan.tasks.map((t) => t.id));
      for (const task of plan.tasks) {
        for (const dep of task.dependencies) {
          if (!taskIds.has(dep)) {
            failed = true;
            details.push(`Task "${task.id}" depends on unknown task "${dep}".`);
          }
        }
      }
    }

    // Validate required fields are present
    if (!plan.mission_name || plan.mission_name.trim() === '') {
      failed = true;
      details.push('mission_name is required.');
    }

    if (!plan.objective || plan.objective.trim() === '') {
      failed = true;
      details.push('objective is required.');
    }

    if (!plan.target_identifier || plan.target_identifier.trim() === '') {
      failed = true;
      details.push('target_identifier is required.');
    }

    if (!plan.robot_identifier || plan.robot_identifier.trim() === '') {
      failed = true;
      details.push('robot_identifier is required.');
    }

    return {
      status: failed ? 'FAILED' : 'PASSED',
      details,
    };
  }
}
