import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { SupabaseRealtimeService } from '../supabase/realtime.service';
import { CreateMissionDto, MissionStatus } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { QueryMissionsDto } from './dto/query-missions.dto';
import { PaginatedResponse } from '../common/dto/pagination.dto';

const MISSION_STATE_MACHINE: Record<string, string[]> = {
  [MissionStatus.DRAFT]: [MissionStatus.PLANNING],
  [MissionStatus.PLANNING]: [MissionStatus.VALIDATING],
  [MissionStatus.VALIDATING]: [MissionStatus.READY],
  [MissionStatus.READY]: [MissionStatus.SIMULATING],
  [MissionStatus.SIMULATING]: [
    MissionStatus.COMPLETED,
    MissionStatus.FAILED,
    MissionStatus.ABORTING,
    MissionStatus.PAUSED,
  ],
  [MissionStatus.PAUSED]: [MissionStatus.SIMULATING],
  [MissionStatus.ABORTING]: [MissionStatus.ABORTED],
  [MissionStatus.COMPLETED]: [],
  [MissionStatus.FAILED]: [],
  [MissionStatus.ABORTED]: [],
};

@Injectable()
export class MissionsService {
  private readonly logger = new Logger(MissionsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly realtimeService: SupabaseRealtimeService,
  ) {}

  async findAll(query: QueryMissionsDto): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc',
      name,
      status,
      target_id,
      robot_id,
      created_by,
    } = query;
    const offset = (page - 1) * limit;

    let queryBuilder = this.supabaseService.client
      .from('missions')
      .select('*', { count: 'exact' });

    if (name) {
      queryBuilder = queryBuilder.ilike('name', `%${name}%`);
    }
    if (status) {
      queryBuilder = queryBuilder.eq('status', status);
    }
    if (target_id) {
      queryBuilder = queryBuilder.eq('target_id', target_id);
    }
    if (robot_id) {
      queryBuilder = queryBuilder.eq('robot_id', robot_id);
    }
    if (created_by) {
      queryBuilder = queryBuilder.eq('created_by', created_by);
    }

    const { data, error, count } = await queryBuilder
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      this.logger.error(`Error fetching missions: ${error.message}`);
      throw error;
    }

    return new PaginatedResponse(data || [], count || 0, page, limit);
  }

  async findOne(id: string): Promise<any> {
    const { data, error } = await this.supabaseService.client
      .from('missions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (
        error.message?.includes('Cannot coerce') ||
        error.code === 'PGRST116'
      ) {
        throw new NotFoundException(`Mission with ID ${id} not found`);
      }
      this.logger.error(`Error fetching mission: ${error.message}`);
      throw new NotFoundException(`Mission with ID ${id} not found`);
    }

    return data;
  }

  async create(dto: CreateMissionDto): Promise<any> {
    if (dto.target_id) {
      const { data: target, error: tErr } = await this.supabaseService.client
        .from('space_objects')
        .select('id')
        .eq('id', dto.target_id)
        .single();
      if (tErr || !target) {
        throw new BadRequestException(
          `Target space object ${dto.target_id} not found`,
        );
      }
    }

    if (dto.robot_id) {
      const { data: robot, error: rErr } = await this.supabaseService.client
        .from('space_objects')
        .select('id')
        .eq('id', dto.robot_id)
        .single();
      if (rErr || !robot) {
        throw new BadRequestException(
          `Robot space object ${dto.robot_id} not found`,
        );
      }
    }

    const { data, error } = await this.supabaseService.client
      .from('missions')
      .insert({
        name: dto.name,
        objective: dto.objective,
        target_id: dto.target_id || null,
        robot_id: dto.robot_id || null,
        status: dto.status || MissionStatus.DRAFT,
        priority: dto.priority || 0,
        created_by: dto.created_by || null,
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`Error creating mission: ${error.message}`);
      throw error;
    }

    await this.createEvent(
      data.id,
      'MISSION_CREATED',
      'info',
      `Mission "${data.name}" created`,
      {
        objective: data.objective,
        target_id: data.target_id,
        robot_id: data.robot_id,
      },
    );

    this.logger.log(`Created mission: ${data.id} (${data.name})`);
    return data;
  }

  async update(id: string, dto: UpdateMissionDto): Promise<any> {
    const mission = await this.findOne(id);

    if (dto.status && dto.status !== mission.status) {
      const allowed = MISSION_STATE_MACHINE[mission.status];
      if (!allowed || !allowed.includes(dto.status)) {
        throw new ConflictException(
          `Cannot transition from ${mission.status} to ${dto.status}. Allowed: ${allowed?.join(', ') || 'none (terminal state)'}`,
        );
      }
    }

    const updatePayload: Record<string, any> = {};
    if (dto.name !== undefined) updatePayload.name = dto.name;
    if (dto.objective !== undefined) updatePayload.objective = dto.objective;
    if (dto.target_id !== undefined) updatePayload.target_id = dto.target_id;
    if (dto.robot_id !== undefined) updatePayload.robot_id = dto.robot_id;
    if (dto.status !== undefined) updatePayload.status = dto.status;
    if (dto.priority !== undefined) updatePayload.priority = dto.priority;

    if (Object.keys(updatePayload).length === 0) {
      return mission;
    }

    const { data, error } = await this.supabaseService.client
      .from('missions')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error(`Error updating mission: ${error.message}`);
      throw error;
    }

    this.logger.log(`Updated mission: ${data.id}`);
    return data;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    const { error } = await this.supabaseService.client
      .from('missions')
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error(`Error deleting mission: ${error.message}`);
      throw error;
    }

    this.logger.log(`Deleted mission: ${id}`);
  }

  private async transitionState(
    id: string,
    targetStatus: MissionStatus,
    eventType: string,
    eventTitle: string,
    eventSeverity: string = 'info',
    metadata?: Record<string, any>,
  ): Promise<any> {
    const mission = await this.findOne(id);

    const allowed = MISSION_STATE_MACHINE[mission.status];
    if (!allowed || !allowed.includes(targetStatus)) {
      throw new ConflictException(
        `Cannot transition from ${mission.status} to ${targetStatus}. Allowed: ${allowed?.join(', ') || 'none (terminal state)'}`,
      );
    }

    const updatePayload: Record<string, any> = { status: targetStatus };
    if (targetStatus === MissionStatus.SIMULATING && !mission.started_at) {
      updatePayload.started_at = new Date().toISOString();
    }
    if (
      targetStatus === MissionStatus.COMPLETED ||
      targetStatus === MissionStatus.FAILED ||
      targetStatus === MissionStatus.ABORTED
    ) {
      updatePayload.completed_at = new Date().toISOString();
    }

    const { data, error } = await this.supabaseService.client
      .from('missions')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error(`Error transitioning mission: ${error.message}`);
      throw error;
    }

    await this.createEvent(id, eventType, eventSeverity, eventTitle, metadata);

    const realtimeChannel = `mission.${this.getRealtimeChannel(targetStatus)}`;
    this.realtimeService.subscribe(realtimeChannel, () => {});
    this.logger.log(`Mission ${id}: ${mission.status} → ${targetStatus}`);
    return data;
  }

  async plan(id: string): Promise<any> {
    return this.transitionState(
      id,
      MissionStatus.PLANNING,
      'PLANNING_STARTED',
      'Planning phase started',
      'info',
    );
  }

  async validate(id: string): Promise<any> {
    return this.transitionState(
      id,
      MissionStatus.VALIDATING,
      'VALIDATION_STARTED',
      'Validation phase started',
      'info',
    );
  }

  async ready(id: string): Promise<any> {
    return this.transitionState(
      id,
      MissionStatus.READY,
      'VALIDATION_COMPLETED',
      'Mission ready for simulation',
      'success',
    );
  }

  async simulate(id: string): Promise<any> {
    return this.transitionState(
      id,
      MissionStatus.SIMULATING,
      'SIMULATION_STARTED',
      'Simulation started',
      'info',
    );
  }

  async pause(id: string): Promise<any> {
    return this.transitionState(
      id,
      MissionStatus.PAUSED,
      'SIMULATION_PAUSED',
      'Simulation paused',
      'warning',
    );
  }

  async resume(id: string): Promise<any> {
    return this.transitionState(
      id,
      MissionStatus.SIMULATING,
      'SIMULATION_STARTED',
      'Simulation resumed',
      'info',
    );
  }

  async abort(id: string): Promise<any> {
    const mission = await this.findOne(id);
    if (mission.status === MissionStatus.SIMULATING) {
      return this.transitionState(
        id,
        MissionStatus.ABORTING,
        'MISSION_ABORTED',
        'Mission abort initiated from simulation',
        'warning',
      );
    }
    if (mission.status === MissionStatus.ABORTING) {
      return this.transitionState(
        id,
        MissionStatus.ABORTED,
        'MISSION_ABORTED',
        'Mission aborted',
        'critical',
      );
    }
    throw new ConflictException(
      `Cannot abort mission in ${mission.status} state. Must be SIMULATING or ABORTING.`,
    );
  }

  async getEvents(missionId: string): Promise<any[]> {
    await this.findOne(missionId);

    const { data, error } = await this.supabaseService.client
      .from('mission_events')
      .select('*')
      .eq('mission_id', missionId)
      .order('timestamp', { ascending: true });

    if (error) {
      this.logger.error(`Error fetching mission events: ${error.message}`);
      throw error;
    }

    return data || [];
  }

  async getReport(missionId: string): Promise<any> {
    await this.findOne(missionId);

    const { data, error } = await this.supabaseService.client
      .from('reports')
      .select('*')
      .eq('mission_id', missionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      this.logger.error(`Error fetching mission report: ${error.message}`);
      throw error;
    }

    return data || null;
  }

  private async createEvent(
    missionId: string,
    eventType: string,
    severity: string,
    title: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const { error } = await this.supabaseService.client
      .from('mission_events')
      .insert({
        mission_id: missionId,
        event_type: eventType,
        severity,
        title,
        metadata: metadata || {},
      });

    if (error) {
      this.logger.error(`Error creating mission event: ${error.message}`);
    }
  }

  private getRealtimeChannel(status: MissionStatus): string {
    const map: Record<string, string> = {
      [MissionStatus.DRAFT]: 'created',
      [MissionStatus.PLANNING]: 'updated',
      [MissionStatus.VALIDATING]: 'updated',
      [MissionStatus.READY]: 'updated',
      [MissionStatus.SIMULATING]: 'started',
      [MissionStatus.PAUSED]: 'paused',
      [MissionStatus.COMPLETED]: 'completed',
      [MissionStatus.FAILED]: 'failed',
      [MissionStatus.ABORTING]: 'updated',
      [MissionStatus.ABORTED]: 'failed',
    };
    return map[status] || 'updated';
  }
}
