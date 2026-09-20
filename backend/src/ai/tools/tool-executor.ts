import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { IntelligenceService } from '../../intelligence/intelligence.service';

export interface ToolResult {
  success: boolean;
  data: unknown;
  error?: string;
}

@Injectable()
export class ToolExecutor {
  private readonly logger = new Logger(ToolExecutor.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly intelligence: IntelligenceService,
  ) {}

  async execute(
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<ToolResult> {
    this.logger.log(`Executing tool: ${toolName}`);
    try {
      switch (toolName) {
        case 'get_satellite_state':
          return await this.getSatelliteState(args.identifier as string);
        case 'get_robot_state':
          return await this.getRobotState(args.identifier as string);
        case 'get_nearby_objects':
          return await this.getNearbyObjects(
            args.reference_id as string,
            args.max_distance_km as number,
          );
        case 'calculate_trajectory':
          return await this.calculateTrajectory(args);
        case 'calculate_delta_v':
          return await this.calculateDeltaV(
            args.from_radius_km as number,
            args.to_radius_km as number,
          );
        case 'calculate_collision_risk':
          return await this.calculateCollisionRisk(args);
        case 'simulate_mission':
          return await this.simulateMission(args);
        case 'inspect_target':
          return await this.inspectTarget(args);
        case 'generate_report':
          return await this.generateReport(args);
        default:
          return {
            success: false,
            data: null,
            error: `Unknown tool: ${toolName}`,
          };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Tool ${toolName} failed: ${msg}`);
      return { success: false, data: null, error: msg };
    }
  }

  private async getSatelliteState(identifier: string): Promise<ToolResult> {
    // Try by name first, then by ID
    let { data: satellite } = await this.supabase.client
      .from('satellites')
      .select('*, space_objects(*)')
      .ilike('space_objects.name', identifier)
      .single();

    if (!satellite) {
      const { data: byId } = await this.supabase.client
        .from('satellites')
        .select('*, space_objects(*)')
        .eq('space_object_id', identifier)
        .single();
      satellite = byId;
    }

    if (!satellite) {
      return {
        success: false,
        data: null,
        error: `Satellite "${identifier}" not found`,
      };
    }

    // Get latest orbital state
    const { data: orbitalState } = await this.supabase.client
      .from('orbital_states')
      .select('*')
      .eq('space_object_id', satellite.space_object_id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    // Get latest telemetry
    const { data: telemetry } = await this.supabase.client
      .from('telemetry')
      .select('*')
      .eq('space_object_id', satellite.space_object_id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    return {
      success: true,
      data: {
        satellite: satellite.space_objects,
        satellite_record: satellite,
        orbital_state: orbitalState,
        telemetry,
      },
    };
  }

  private async getRobotState(identifier: string): Promise<ToolResult> {
    let { data: robot } = await this.supabase.client
      .from('robots')
      .select('*, space_objects(*)')
      .ilike('space_objects.name', identifier)
      .single();

    if (!robot) {
      const { data: byId } = await this.supabase.client
        .from('robots')
        .select('*, space_objects(*)')
        .eq('space_object_id', identifier)
        .single();
      robot = byId;
    }

    if (!robot) {
      return {
        success: false,
        data: null,
        error: `Robot "${identifier}" not found`,
      };
    }

    const { data: orbitalState } = await this.supabase.client
      .from('orbital_states')
      .select('*')
      .eq('space_object_id', robot.space_object_id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    return {
      success: true,
      data: {
        robot: robot.space_objects,
        robot_record: robot,
        orbital_state: orbitalState,
      },
    };
  }

  private async getNearbyObjects(
    referenceId: string,
    maxDistanceKm: number = 1000,
  ): Promise<ToolResult> {
    const { data: refState } = await this.supabase.client
      .from('orbital_states')
      .select('position_x, position_y, position_z')
      .eq('space_object_id', referenceId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (!refState) {
      return {
        success: false,
        data: null,
        error: 'Reference object has no orbital state',
      };
    }

    // Get all objects with orbital states and compute distances
    const { data: allStates } = await this.supabase.client
      .from('orbital_states')
      .select(
        'space_object_id, position_x, position_y, position_z, velocity_x, velocity_y, velocity_z',
      )
      .order('timestamp', { ascending: false });

    if (!allStates) {
      return { success: true, data: { objects: [] } };
    }

    // Deduplicate by space_object_id (keep latest)
    const seen = new Set<string>();
    const unique: typeof allStates = [];
    for (const s of allStates) {
      if (!seen.has(s.space_object_id)) {
        seen.add(s.space_object_id);
        unique.push(s);
      }
    }

    const ref = [refState.position_x, refState.position_y, refState.position_z];
    const nearby = unique
      .filter((s) => s.space_object_id !== referenceId)
      .map((s) => {
        const dx = s.position_x - ref[0];
        const dy = s.position_y - ref[1];
        const dz = s.position_z - ref[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        return {
          space_object_id: s.space_object_id,
          distance_km: dist,
          position: [s.position_x, s.position_y, s.position_z],
        };
      })
      .filter((s) => s.distance_km <= maxDistanceKm)
      .sort((a, b) => a.distance_km - b.distance_km);

    return { success: true, data: { objects: nearby, count: nearby.length } };
  }

  private async calculateTrajectory(
    args: Record<string, unknown>,
  ): Promise<ToolResult> {
    const robotState = args.robot_state as {
      position_km: number[];
      velocity_kms: number[];
    };
    const targetState = args.target_state as {
      position_km: number[];
      velocity_kms: number[];
    };

    const result = await this.intelligence.planTrajectory({
      robot_state: {
        position_km: robotState.position_km as [number, number, number],
        velocity_kms: robotState.velocity_kms as [number, number, number],
      },
      target_state: {
        position_km: targetState.position_km as [number, number, number],
        velocity_kms: targetState.velocity_kms as [number, number, number],
      },
      max_delta_v_ms: (args.max_delta_v_ms as number) || 500,
    });

    return { success: true, data: result };
  }

  private async calculateDeltaV(
    fromRadiusKm: number,
    toRadiusKm: number,
  ): Promise<ToolResult> {
    // Direct Keplerian calculation (no LLM)
    const MU = 398600.4418;
    const r1 = fromRadiusKm;
    const r2 = toRadiusKm;
    const a_t = (r1 + r2) / 2;
    const v_circ1 = Math.sqrt(MU / r1);
    const v_t1 = Math.sqrt(MU * (2 / r1 - 1 / a_t));
    const v_t2 = Math.sqrt(MU * (2 / r2 - 1 / a_t));
    const v_circ2 = Math.sqrt(MU / r2);
    const dv1 = Math.abs(v_t1 - v_circ1);
    const dv2 = Math.abs(v_circ2 - v_t2);
    const dv_total = dv1 + dv2;
    const transferTime = Math.PI * Math.sqrt(a_t ** 3 / MU);

    return {
      success: true,
      data: {
        delta_v_ms: dv_total * 1000,
        delta_v1_ms: dv1 * 1000,
        delta_v2_ms: dv2 * 1000,
        transfer_time_seconds: transferTime,
        transfer_semi_major_axis_km: a_t,
      },
    };
  }

  private async calculateCollisionRisk(
    args: Record<string, unknown>,
  ): Promise<ToolResult> {
    const objA = args.object_a as {
      position_km: number[];
      velocity_kms: number[];
    };
    const objB = args.object_b as {
      position_km: number[];
      velocity_kms: number[];
    };

    const result = await this.intelligence.assessCollisionRisk({
      object_a: {
        position_km: objA.position_km as [number, number, number],
        velocity_kms: objA.velocity_kms as [number, number, number],
      },
      object_b: {
        position_km: objB.position_km as [number, number, number],
        velocity_kms: objB.velocity_kms as [number, number, number],
      },
      time_horizon_seconds: (args.time_horizon_seconds as number) || 3600,
    });

    return { success: true, data: result };
  }

  private async simulateMission(
    args: Record<string, unknown>,
  ): Promise<ToolResult> {
    // Delegate to Python simulation engine
    const resp = await fetch(`http://localhost:8000/simulation/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(30_000),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return {
        success: false,
        data: null,
        error: `Simulation failed: ${resp.status} ${text}`,
      };
    }

    return { success: true, data: await resp.json() };
  }

  private async inspectTarget(
    args: Record<string, unknown>,
  ): Promise<ToolResult> {
    const targetId = args.target_id as string;
    const robotId = args.robot_id as string;
    const inspectionDist = (args.inspection_distance_km as number) || 5;

    // Get both states
    const { data: targetState } = await this.supabase.client
      .from('orbital_states')
      .select('*')
      .eq('space_object_id', targetId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    const { data: robotState } = await this.supabase.client
      .from('orbital_states')
      .select('*')
      .eq('space_object_id', robotId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (!targetState || !robotState) {
      return {
        success: false,
        data: null,
        error: 'Missing orbital states for inspection',
      };
    }

    // Calculate trajectory for inspection approach
    const trajectory = await this.intelligence.planTrajectory({
      robot_state: {
        position_km: [
          robotState.position_x,
          robotState.position_y,
          robotState.position_z,
        ],
        velocity_kms: [
          robotState.velocity_x,
          robotState.velocity_y,
          robotState.velocity_z,
        ],
      },
      target_state: {
        position_km: [
          targetState.position_x,
          targetState.position_y,
          targetState.position_z,
        ],
        velocity_kms: [
          targetState.velocity_x,
          targetState.velocity_y,
          targetState.velocity_z,
        ],
      },
      max_delta_v_ms: 500,
    });

    // Assess collision risk during proximity operations
    const risk = await this.intelligence.assessCollisionRisk({
      object_a: {
        position_km: [
          robotState.position_x,
          robotState.position_y,
          robotState.position_z,
        ],
        velocity_kms: [
          robotState.velocity_x,
          robotState.velocity_y,
          robotState.velocity_z,
        ],
      },
      object_b: {
        position_km: [
          targetState.position_x,
          targetState.position_y,
          targetState.position_z,
        ],
        velocity_kms: [
          targetState.velocity_x,
          targetState.velocity_y,
          targetState.velocity_z,
        ],
      },
      time_horizon_seconds: trajectory.duration_seconds,
      time_step_seconds: 60,
      collision_radius_km: inspectionDist,
    });

    return {
      success: true,
      data: {
        target: targetState,
        robot: robotState,
        trajectory,
        risk,
        inspection_distance_km: inspectionDist,
        observations: [
          'Target orbital elements computed',
          'Approach trajectory calculated',
          'Collision risk assessed',
          'Proximity operations plan generated',
        ],
      },
    };
  }

  private async generateReport(
    args: Record<string, unknown>,
  ): Promise<ToolResult> {
    const report = {
      title: `Mission Report: ${args.mission_name}`,
      mission_id: args.mission_id,
      objective: args.objective,
      status: args.status,
      generated_at: new Date().toISOString(),
      summary: `Mission "${args.mission_name}" completed with status: ${args.status}.`,
      findings: (args.findings as string[]) || [],
      recommendations: (args.recommendations as string[]) || [],
      sections: {
        objective: args.objective,
        status: args.status,
        key_findings: args.findings,
        recommendations: args.recommendations,
      },
    };

    return { success: true, data: report };
  }
}
