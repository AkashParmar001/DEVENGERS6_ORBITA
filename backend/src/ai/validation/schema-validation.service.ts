import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import type {
  MissionPlanResponse,
  AnomalyAnalysis,
  RiskExplanation,
  MissionReport,
} from '../ai.types';

@Injectable()
export class SchemaValidationService {
  private readonly logger = new Logger(SchemaValidationService.name);

  validatePlanSchema(raw: unknown): MissionPlanResponse {
    this.logger.log('Validating mission plan schema');

    const errors: string[] = [];

    if (!raw || typeof raw !== 'object') {
      throw new BadRequestException({
        message: 'Mission plan output is not a valid object',
        code: 'INVALID_PLAN_SCHEMA',
        details: ['AI output must be a JSON object'],
      });
    }

    const plan = raw as Record<string, unknown>;

    const stringFields = [
      'mission_name',
      'objective',
      'mission_type',
      'target_identifier',
      'robot_identifier',
    ];
    for (const field of stringFields) {
      if (
        typeof plan[field] !== 'string' ||
        (plan[field] as string).trim() === ''
      ) {
        errors.push(`${field} must be a non-empty string`);
      }
    }

    if (!Array.isArray(plan.tasks) || plan.tasks.length === 0) {
      errors.push('tasks must be a non-empty array');
    } else {
      plan.tasks.forEach((task: unknown, index: number) => {
        if (!task || typeof task !== 'object') {
          errors.push(`tasks[${index}] must be an object`);
          return;
        }
        const t = task as Record<string, unknown>;
        if (typeof t.id !== 'string')
          errors.push(`tasks[${index}].id must be a string`);
        if (typeof t.type !== 'string')
          errors.push(`tasks[${index}].type must be a string`);
        if (typeof t.description !== 'string')
          errors.push(`tasks[${index}].description must be a string`);
        if (!Array.isArray(t.dependencies))
          errors.push(`tasks[${index}].dependencies must be an array`);
        if (typeof t.estimated_duration_seconds !== 'number')
          errors.push(
            `tasks[${index}].estimated_duration_seconds must be a number`,
          );
        if (!Array.isArray(t.tools_required))
          errors.push(`tasks[${index}].tools_required must be an array`);
      });
    }

    if (!plan.constraints || typeof plan.constraints !== 'object') {
      errors.push('constraints must be an object');
    } else {
      const c = plan.constraints as Record<string, unknown>;
      const numFields = [
        'max_delta_v_ms',
        'max_duration_seconds',
        'min_safe_distance_km',
        'max_collision_probability',
      ];
      for (const field of numFields) {
        if (typeof c[field] !== 'number') {
          errors.push(`constraints.${field} must be a number`);
        }
      }
    }

    if (!Array.isArray(plan.required_validation)) {
      errors.push('required_validation must be an array');
    }
    if (!Array.isArray(plan.success_conditions)) {
      errors.push('success_conditions must be an array');
    }
    if (!Array.isArray(plan.risk_flags)) {
      errors.push('risk_flags must be an array');
    }
    if (!Array.isArray(plan.assumptions)) {
      errors.push('assumptions must be an array');
    }
    if (!Array.isArray(plan.uncertainty)) {
      errors.push('uncertainty must be an array');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Mission plan output does not match expected schema',
        code: 'INVALID_PLAN_SCHEMA',
        details: errors,
      });
    }

    return raw as MissionPlanResponse;
  }

  validateAnomalyAnalysis(raw: unknown): AnomalyAnalysis {
    this.logger.log('Validating anomaly analysis schema');

    const errors: string[] = [];

    if (!raw || typeof raw !== 'object') {
      throw new BadRequestException({
        message: 'Anomaly analysis output is not a valid object',
        code: 'INVALID_ANOMALY_SCHEMA',
        details: ['AI output must be a JSON object'],
      });
    }

    const a = raw as Record<string, unknown>;

    if (typeof a.summary !== 'string' || a.summary.trim() === '') {
      errors.push('summary must be a non-empty string');
    }
    if (!Array.isArray(a.possible_causes)) {
      errors.push('possible_causes must be an array');
    }
    if (!Array.isArray(a.evidence)) {
      errors.push('evidence must be an array');
    }
    const validSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    if (!validSeverities.includes(a.severity as string)) {
      errors.push(`severity must be one of: ${validSeverities.join(', ')}`);
    }
    if (!Array.isArray(a.recommended_investigations)) {
      errors.push('recommended_investigations must be an array');
    }
    if (typeof a.required_human_review !== 'boolean') {
      errors.push('required_human_review must be a boolean');
    }
    if (
      typeof a.confidence !== 'number' ||
      a.confidence < 0 ||
      a.confidence > 1
    ) {
      errors.push('confidence must be a number between 0 and 1');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Anomaly analysis output does not match expected schema',
        code: 'INVALID_ANOMALY_SCHEMA',
        details: errors,
      });
    }

    return raw as AnomalyAnalysis;
  }

  validateRiskExplanation(raw: unknown): RiskExplanation {
    this.logger.log('Validating risk explanation schema');

    const errors: string[] = [];

    if (!raw || typeof raw !== 'object') {
      throw new BadRequestException({
        message: 'Risk explanation output is not a valid object',
        code: 'INVALID_RISK_SCHEMA',
        details: ['AI output must be a JSON object'],
      });
    }

    const r = raw as Record<string, unknown>;

    if (typeof r.summary !== 'string' || r.summary.trim() === '') {
      errors.push('summary must be a non-empty string');
    }
    if (!Array.isArray(r.factors)) {
      errors.push('factors must be an array');
    }
    if (!Array.isArray(r.recommendations)) {
      errors.push('recommendations must be an array');
    }
    if (
      typeof r.severity_assessment !== 'string' ||
      r.severity_assessment.trim() === ''
    ) {
      errors.push('severity_assessment must be a non-empty string');
    }
    if (typeof r.human_review_required !== 'boolean') {
      errors.push('human_review_required must be a boolean');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Risk explanation output does not match expected schema',
        code: 'INVALID_RISK_SCHEMA',
        details: errors,
      });
    }

    return raw as RiskExplanation;
  }

  validateMissionReport(raw: unknown): MissionReport {
    this.logger.log('Validating mission report schema');

    const errors: string[] = [];

    if (!raw || typeof raw !== 'object') {
      throw new BadRequestException({
        message: 'Mission report output is not a valid object',
        code: 'INVALID_REPORT_SCHEMA',
        details: ['AI output must be a JSON object'],
      });
    }

    const r = raw as Record<string, unknown>;

    if (typeof r.title !== 'string' || r.title.trim() === '') {
      errors.push('title must be a non-empty string');
    }
    if (
      typeof r.executive_summary !== 'string' ||
      r.executive_summary.trim() === ''
    ) {
      errors.push('executive_summary must be a non-empty string');
    }
    if (!Array.isArray(r.factual_observations)) {
      errors.push('factual_observations must be an array');
    }
    if (!Array.isArray(r.calculated_results)) {
      errors.push('calculated_results must be an array');
    }
    if (!Array.isArray(r.ai_interpretation)) {
      errors.push('ai_interpretation must be an array');
    }
    if (!Array.isArray(r.unresolved_uncertainties)) {
      errors.push('unresolved_uncertainties must be an array');
    }
    if (!Array.isArray(r.recommendations)) {
      errors.push('recommendations must be an array');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Mission report output does not match expected schema',
        code: 'INVALID_REPORT_SCHEMA',
        details: errors,
      });
    }

    return raw as MissionReport;
  }
}
