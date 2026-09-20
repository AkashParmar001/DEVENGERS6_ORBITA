import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MissionPlannerService } from './mission-planner.service';
import { PlanMissionDto, PlanMissionResponseDto } from './dto/plan-mission.dto';

@ApiTags('Mission Planner')
@Controller('mission-planner')
export class MissionPlannerController {
  constructor(private readonly planner: MissionPlannerService) {}

  @Post('plan')
  @ApiOperation({ summary: 'Plan and execute a mission from natural language' })
  @ApiResponse({ status: 200, type: PlanMissionResponseDto })
  async planMission(
    @Body() dto: PlanMissionDto,
  ): Promise<PlanMissionResponseDto> {
    return this.planner.planAndExecute(
      dto.command,
      dto.provider,
    ) as Promise<PlanMissionResponseDto>;
  }
}
