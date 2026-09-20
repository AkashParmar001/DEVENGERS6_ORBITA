import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IntelligenceService } from './intelligence.service';
import {
  TrajectoryPlanRequestDto,
  TrajectoryPlanResponseDto,
  CollisionRiskRequestDto,
  CollisionRiskResponseDto,
  IntelligenceHealthDto,
} from './dto/intelligence.dto';

@ApiTags('intelligence')
@Controller('intelligence')
export class IntelligenceController {
  constructor(private readonly intelligence: IntelligenceService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check Python intelligence service health' })
  @ApiResponse({ status: 200, type: IntelligenceHealthDto })
  async health(): Promise<IntelligenceHealthDto> {
    return this.intelligence.health();
  }

  @Post('trajectory/plan')
  @ApiOperation({ summary: 'Plan a trajectory from robot to target' })
  @ApiResponse({ status: 200, type: TrajectoryPlanResponseDto })
  async planTrajectory(
    @Body() req: TrajectoryPlanRequestDto,
  ): Promise<TrajectoryPlanResponseDto> {
    return this.intelligence.planTrajectory(req);
  }

  @Post('risk/collision')
  @ApiOperation({ summary: 'Assess collision risk between two objects' })
  @ApiResponse({ status: 200, type: CollisionRiskResponseDto })
  async assessCollisionRisk(
    @Body() req: CollisionRiskRequestDto,
  ): Promise<CollisionRiskResponseDto> {
    return this.intelligence.assessCollisionRisk(req);
  }
}
