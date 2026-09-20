import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class PlanMissionDto {
  @ApiProperty({
    description: 'Natural language mission command',
    example: 'Inspect SAT-102 using ORBITAL-03',
  })
  @IsString()
  @IsNotEmpty()
  command: string;

  @ApiPropertyOptional({
    description: 'AI provider to use',
    enum: ['groq', 'gemini', 'openai'],
    default: 'groq',
  })
  @IsOptional()
  @IsString()
  provider?: string = 'groq';
}

export class PlanMissionResponseDto {
  @ApiProperty()
  mission_id: string;

  @ApiProperty()
  mission_name: string;

  @ApiProperty()
  objective: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  plan: any;

  @ApiProperty()
  trajectory: any;

  @ApiProperty()
  risk_assessment: any;

  @ApiProperty()
  simulation_result: any;

  @ApiProperty()
  report: any;

  @ApiProperty()
  events: any[];

  @ApiProperty()
  steps_completed: string[];
}
