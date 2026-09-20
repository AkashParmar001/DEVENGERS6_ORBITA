import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SimulationService } from './simulation.service';
import {
  SimulationRunRequestDto,
  SimulationRunResponseDto,
} from './dto/simulation.dto';

@ApiTags('Simulation')
@Controller('simulation')
export class SimulationController {
  constructor(private readonly simulation: SimulationService) {}

  @Post('run')
  @ApiOperation({ summary: 'Run orbital simulation via Python engine' })
  @ApiResponse({ status: 200, type: SimulationRunResponseDto })
  async runSimulation(
    @Body() dto: SimulationRunRequestDto,
  ): Promise<SimulationRunResponseDto> {
    return this.simulation.runSimulation(dto);
  }
}
