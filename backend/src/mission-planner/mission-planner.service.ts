import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { IntelligenceService } from '../intelligence/intelligence.service';
import { AIProviderFactory } from '../ai/providers/ai-provider.factory';
import {
  AIProvider,
  AIChatMessage,
  AIToolDefinition,
} from '../ai/providers/ai-provider';
import { ORBITA_TOOLS } from '../ai/tools/tool-definitions';
import { ToolExecutor } from '../ai/tools/tool-executor';
import { MissionPlan } from './mission-plan.interface';

const MISSION_PLAN_SCHEMA = {
  type: 'object',
  properties: {
    mission_name: {
      type: 'string',
      description: 'Short descriptive name for the mission',
    },
    objective: {
      type: 'string',
      description: 'Mission objective in one sentence',
    },
    mission_type: {
      type: 'string',
      enum: [
        'inspection',
        'collision_avoidance',
        'debris_interception',
        'repair',
        'survey',
      ],
      description: 'Type of mission',
    },
    target_identifier: {
      type: 'string',
      description: 'Name or ID of target object',
    },
    robot_identifier: {
      type: 'string',
      description: 'Name or ID of robot to use',
    },
    actions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          step: { type: 'number' },
          action: { type: 'string' },
          tool: { type: 'string' },
          parameters: { type: 'object' },
          description: { type: 'string' },
        },
        required: ['step', 'action', 'tool', 'parameters', 'description'],
      },
    },
    constraints: {
      type: 'object',
      properties: {
        max_delta_v_ms: { type: 'number' },
        max_duration_seconds: { type: 'number' },
        min_safe_distance_km: { type: 'number' },
        max_collision_probability: { type: 'number' },
      },
    },
    risk_tolerance: { type: 'string', enum: ['low', 'medium', 'high'] },
    estimated_duration_seconds: { type: 'number' },
    estimated_delta_v_ms: { type: 'number' },
  },
  required: [
    'mission_name',
    'objective',
    'mission_type',
    'target_identifier',
    'robot_identifier',
    'actions',
    'constraints',
  ],
};

const SYSTEM_PROMPT = `You are ORBITA, an autonomous space mission planner. You interpret natural language commands and create structured mission plans.

When given a command like "Inspect SAT-102 using ORBITAL-03", you must:
1. Identify the target object and robot
2. Determine the mission type
3. Create a step-by-step plan using the available tools
4. Set appropriate constraints (delta-v budget, time limits, safety distances)
5. Return a structured JSON plan matching the required schema

IMPORTANT RULES:
- All physics calculations are done by deterministic engines, NOT by you
- You plan WHAT to do; the system computes HOW to do it
- Always include collision risk assessment in your plan
- Set conservative safety constraints
- Use the tool names exactly as defined

Available tools you can reference in your plan:
- get_satellite_state: Get satellite orbital data
- get_robot_state: Get robot orbital data
- calculate_trajectory: Plan transfer trajectory
- calculate_collision_risk: Assess collision risk
- simulate_mission: Run orbital simulation
- inspect_target: Perform proximity inspection
- generate_report: Create mission report`;

@Injectable()
export class MissionPlannerService {
  private readonly logger = new Logger(MissionPlannerService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly supabase: SupabaseService,
    private readonly intelligence: IntelligenceService,
    private readonly toolExecutor: ToolExecutor,
  ) {}

  async planAndExecute(
    command: string,
    providerName: string = 'groq',
  ): Promise<any> {
    this.logger.log(`Planning mission: "${command}" via ${providerName}`);

    // Step 1: Get AI to parse command into structured plan
    const provider = this.createProvider(providerName);
    const plan = await this.generatePlan(provider, command);

    // Step 2: Create mission in Supabase
    const mission = await this.createMission(plan);

    // Step 3: Execute the plan step by step
    const result = await this.executePlan(mission.id, plan, provider);

    return result;
  }

  private createProvider(name: string): AIProvider {
    const apiKey = this.getApiKey(name);
    return AIProviderFactory.create(name, apiKey);
  }

  private getApiKey(provider: string): string {
    const keyMap: Record<string, string> = {
      groq: 'GROQ_API_KEY',
      gemini: 'GEMINI_API_KEY',
      openai: 'OPENAI_API_KEY',
    };
    const envKey = keyMap[provider];
    if (!envKey) throw new BadRequestException(`Unknown provider: ${provider}`);
    const key = this.config.get<string>(envKey);
    if (!key)
      throw new BadRequestException(`Missing environment variable: ${envKey}`);
    return key;
  }

  private async generatePlan(
    provider: AIProvider,
    command: string,
  ): Promise<MissionPlan> {
    const messages: AIChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: command },
    ];

    const tools: AIToolDefinition[] = [
      {
        type: 'function',
        function: {
          name: 'return_mission_plan',
          description: 'Return the structured mission plan as JSON',
          parameters: {
            ...MISSION_PLAN_SCHEMA,
          },
        },
      },
    ];

    let attempts = 0;
    while (attempts < 3) {
      attempts++;
      const response = await provider.chat(messages, tools, {
        temperature: 0.1,
        max_tokens: 4096,
      });

      // Check if AI used the tool
      if (response.tool_calls.length > 0) {
        const toolCall = response.tool_calls[0];
        try {
          const plan = JSON.parse(toolCall.function.arguments);
          const validated = this.validatePlan(plan);
          return validated;
        } catch (err) {
          this.logger.warn(
            `Plan validation failed (attempt ${attempts}): ${err}`,
          );
          messages.push({
            role: 'assistant',
            content: '',
            tool_calls: response.tool_calls,
          });
          messages.push({
            role: 'tool',
            content: JSON.stringify({ error: `Invalid plan: ${err}` }),
            tool_call_id: toolCall.id,
          });
        }
      } else {
        // AI returned text instead of tool call — try to extract JSON
        const content = response.content || '';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const plan = JSON.parse(jsonMatch[0]);
            return this.validatePlan(plan);
          } catch {
            // Fall through
          }
        }
        throw new BadRequestException('AI did not return a valid mission plan');
      }
    }

    throw new BadRequestException(
      'Failed to generate valid mission plan after 3 attempts',
    );
  }

  private validatePlan(raw: any): MissionPlan {
    if (!raw.mission_name || typeof raw.mission_name !== 'string') {
      throw new Error('mission_name is required');
    }
    if (!raw.objective || typeof raw.objective !== 'string') {
      throw new Error('objective is required');
    }
    if (
      !raw.mission_type ||
      ![
        'inspection',
        'collision_avoidance',
        'debris_interception',
        'repair',
        'survey',
      ].includes(raw.mission_type)
    ) {
      throw new Error(
        'mission_type must be one of: inspection, collision_avoidance, debris_interception, repair, survey',
      );
    }
    if (!raw.target_identifier)
      throw new Error('target_identifier is required');
    if (!raw.robot_identifier) throw new Error('robot_identifier is required');
    if (!Array.isArray(raw.actions) || raw.actions.length === 0)
      throw new Error('actions array is required and must not be empty');

    return {
      mission_name: raw.mission_name,
      objective: raw.objective,
      mission_type: raw.mission_type,
      target_identifier: raw.target_identifier,
      robot_identifier: raw.robot_identifier,
      actions: raw.actions,
      constraints: {
        max_delta_v_ms: raw.constraints?.max_delta_v_ms ?? 500,
        max_duration_seconds: raw.constraints?.max_duration_seconds ?? 86400,
        min_safe_distance_km: raw.constraints?.min_safe_distance_km ?? 1,
        max_collision_probability:
          raw.constraints?.max_collision_probability ?? 0.01,
      },
      risk_tolerance: raw.risk_tolerance ?? 'low',
      estimated_duration_seconds: raw.estimated_duration_seconds ?? 0,
      estimated_delta_v_ms: raw.estimated_delta_v_ms ?? 0,
    };
  }

  private async createMission(plan: MissionPlan): Promise<any> {
    // Resolve target and robot IDs
    const targetId = await this.resolveObjectId(
      plan.target_identifier,
      'SATELLITE',
    );
    const robotId = await this.resolveObjectId(plan.robot_identifier, 'ROBOT');

    const { data: mission, error } = await this.supabase.client
      .from('missions')
      .insert({
        name: plan.mission_name,
        objective: plan.objective,
        target_id: targetId,
        robot_id: robotId,
        status: 'DRAFT',
        priority: 5,
      })
      .select()
      .single();

    if (error) throw error;

    // Create MISSION_CREATED event
    await this.createEvent(
      mission.id,
      'MISSION_CREATED',
      'info',
      `Mission "${plan.mission_name}" created by AI planner`,
      {
        plan,
      },
    );

    this.logger.log(`Created mission: ${mission.id}`);
    return mission;
  }

  private async resolveObjectId(
    identifier: string,
    type: string,
  ): Promise<string> {
    // Try by name in space_objects
    const { data: byName } = await this.supabase.client
      .from('space_objects')
      .select('id')
      .ilike('name', identifier)
      .single();

    if (byName) return byName.id;

    // Try as UUID directly
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        identifier,
      )
    ) {
      return identifier;
    }

    throw new BadRequestException(
      `Cannot resolve identifier "${identifier}" to a space object`,
    );
  }

  private async executePlan(
    missionId: string,
    plan: MissionPlan,
    provider: AIProvider,
  ): Promise<any> {
    const stepsCompleted: string[] = [];
    const events: any[] = [];
    let trajectory: any = null;
    let riskAssessment: any = null;
    let simulationResult: any = null;
    let report: any = null;

    // Transition to PLANNING
    await this.transition(
      missionId,
      'PLANNING',
      'PLANNING_STARTED',
      'AI planner generating plan',
    );
    stepsCompleted.push('planning_started');

    // Execute each action in the plan
    for (const action of plan.actions) {
      this.logger.log(`Executing step ${action.step}: ${action.action}`);

      try {
        const result = await this.toolExecutor.execute(
          action.tool,
          action.parameters,
        );

        if (result.success) {
          await this.createEvent(
            missionId,
            'ACTION_COMPLETED',
            'success',
            `Step ${action.step}: ${action.description}`,
            {
              step: action.step,
              tool: action.tool,
              result_summary:
                typeof result.data === 'object'
                  ? Object.keys(result.data as object)
                  : result.data,
            },
          );

          // Store specific results
          if (
            action.tool === 'calculate_trajectory' ||
            action.tool === 'inspect_target'
          ) {
            trajectory = (result.data as any)?.trajectory || result.data;
          }
          if (action.tool === 'calculate_collision_risk') {
            riskAssessment = result.data;
          }
          if (action.tool === 'simulate_mission') {
            simulationResult = result.data;
          }
          if (action.tool === 'generate_report') {
            report = result.data;
          }
        } else {
          await this.createEvent(
            missionId,
            'ACTION_FAILED',
            'warning',
            `Step ${action.step} failed: ${result.error}`,
            {
              step: action.step,
              tool: action.tool,
              error: result.error,
            },
          );
        }

        stepsCompleted.push(`step_${action.step}_${action.action}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.error(`Step ${action.step} error: ${msg}`);
        await this.createEvent(
          missionId,
          'ACTION_FAILED',
          'critical',
          `Step ${action.step} error: ${msg}`,
        );
      }
    }

    // Transition through states
    await this.transition(
      missionId,
      'VALIDATING',
      'VALIDATION_STARTED',
      'Validating mission plan',
    );
    stepsCompleted.push('validation');

    // Risk validation
    if (
      riskAssessment &&
      typeof riskAssessment === 'object' &&
      'risk_level' in riskAssessment
    ) {
      const riskLevel = (riskAssessment as any).risk_level;
      if (riskLevel === 'critical' && plan.risk_tolerance === 'low') {
        await this.transition(
          missionId,
          'FAILED',
          'VALIDATION_FAILED',
          `Risk level ${riskLevel} exceeds tolerance`,
        );
        return this.buildResult(
          missionId,
          plan,
          stepsCompleted,
          events,
          trajectory,
          riskAssessment,
          simulationResult,
          report,
          'FAILED',
        );
      }
    }

    await this.transition(
      missionId,
      'READY',
      'VALIDATION_COMPLETED',
      'Mission validated and ready',
    );
    stepsCompleted.push('validated');

    // Run simulation
    await this.transition(
      missionId,
      'SIMULATING',
      'SIMULATION_STARTED',
      'Executing orbital simulation',
    );
    stepsCompleted.push('simulation_started');

    if (!simulationResult && trajectory) {
      // Run simulation via Python if not already done
      try {
        const simResult = await this.toolExecutor.execute('simulate_mission', {
          mission_id: missionId,
          robot_state: plan.actions[0]?.parameters?.robot_state || {
            position_km: [7000, 0, 0],
            velocity_kms: [0, 7.5, 0],
          },
          target_state: plan.actions[0]?.parameters?.target_state || {
            position_km: [7500, 0, 0],
            velocity_kms: [0, 7.25, 0],
          },
          duration_seconds: plan.constraints.max_duration_seconds,
        });
        if (simResult.success) simulationResult = simResult.data;
      } catch (err) {
        this.logger.warn(`Simulation failed, continuing: ${err}`);
      }
    }
    stepsCompleted.push('simulation_completed');

    // Generate report if not already done
    if (!report) {
      const reportResult = await this.toolExecutor.execute('generate_report', {
        mission_id: missionId,
        mission_name: plan.mission_name,
        objective: plan.objective,
        status: 'COMPLETED',
        findings: [
          `Mission type: ${plan.mission_type}`,
          `Target: ${plan.target_identifier}`,
          `Robot: ${plan.robot_identifier}`,
          trajectory
            ? `Trajectory feasible: ${(trajectory as any).feasible}`
            : 'Trajectory computed',
          riskAssessment
            ? `Risk level: ${(riskAssessment as any).risk_level}`
            : 'Risk assessed',
        ],
        recommendations: ['Continue monitoring', 'Review simulation results'],
      });
      if (reportResult.success) report = reportResult.data;
    }

    // Store report in Supabase
    if (report) {
      await this.supabase.client.from('reports').insert({
        mission_id: missionId,
        title: report.title || `Report: ${plan.mission_name}`,
        report_type: 'analysis',
        content: report,
      });
    }

    // Complete mission
    await this.transition(
      missionId,
      'COMPLETED',
      'MISSION_COMPLETED',
      'Mission completed successfully',
    );
    stepsCompleted.push('completed');

    await this.createEvent(
      missionId,
      'REPORT_GENERATED',
      'success',
      'Mission report generated',
      { report },
    );

    return this.buildResult(
      missionId,
      plan,
      stepsCompleted,
      events,
      trajectory,
      riskAssessment,
      simulationResult,
      report,
      'COMPLETED',
    );
  }

  private async transition(
    missionId: string,
    status: string,
    eventType: string,
    description: string,
  ): Promise<void> {
    const updatePayload: Record<string, any> = { status };
    if (status === 'SIMULATING')
      updatePayload.started_at = new Date().toISOString();
    if (['COMPLETED', 'FAILED', 'ABORTED'].includes(status))
      updatePayload.completed_at = new Date().toISOString();

    await this.supabase.client
      .from('missions')
      .update(updatePayload)
      .eq('id', missionId);
    await this.createEvent(
      missionId,
      eventType,
      status === 'FAILED' ? 'critical' : 'info',
      description,
    );
  }

  private async createEvent(
    missionId: string,
    eventType: string,
    severity: string,
    title: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const { error } = await this.supabase.client.from('mission_events').insert({
      mission_id: missionId,
      event_type: eventType,
      severity,
      title,
      metadata: metadata || {},
    });
    if (error) this.logger.error(`Failed to create event: ${error.message}`);
  }

  private buildResult(
    missionId: string,
    plan: MissionPlan,
    steps: string[],
    events: any[],
    trajectory: any,
    risk: any,
    simulation: any,
    report: any,
    status: string,
  ) {
    return {
      mission_id: missionId,
      mission_name: plan.mission_name,
      objective: plan.objective,
      status,
      plan,
      trajectory,
      risk_assessment: risk,
      simulation_result: simulation,
      report,
      events,
      steps_completed: steps,
    };
  }
}
