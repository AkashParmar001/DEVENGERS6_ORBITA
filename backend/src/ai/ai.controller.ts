import {
  Controller,
  Post,
  Get,
  Body,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { SchemaValidationService } from './validation/schema-validation.service';
import { AnalyzeAnomalyDto } from './dto/analyze-anomaly.dto';
import { ExplainRiskDto } from './dto/explain-risk.dto';
import { GenerateReportDto } from './dto/generate-report.dto';
import type { AnomalyInput, RiskInput, ReportInput } from './ai.types';

@ApiTags('AI Intelligence')
@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(
    private readonly aiService: AiService,
    private readonly schemaValidation: SchemaValidationService,
  ) {}

  @Post('analyze-anomaly')
  @ApiOperation({ summary: 'Analyze a detected space anomaly using AI' })
  @ApiResponse({
    status: 200,
    description: 'Anomaly analysis completed',
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async analyzeAnomaly(@Body() dto: AnalyzeAnomalyDto) {
    const input: AnomalyInput = {
      object_id: dto.object_id,
      object_name: dto.object_name,
      telemetry: dto.telemetry,
      anomaly: dto.anomaly,
    };

    const result = await this.aiService.analyzeAnomaly(input);
    return this.schemaValidation.validateAnomalyAnalysis(result);
  }

  @Post('explain-risk')
  @ApiOperation({ summary: 'Explain collision risk assessment results' })
  @ApiResponse({
    status: 200,
    description: 'Risk explanation generated',
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async explainRisk(@Body() dto: ExplainRiskDto) {
    const input: RiskInput = {
      mission_id: dto.mission_id,
      risk_metrics: dto.risk_metrics,
      context: dto.context,
    };

    const result = await this.aiService.explainRisk(input);
    return this.schemaValidation.validateRiskExplanation(result);
  }

  @Post('generate-report')
  @ApiOperation({ summary: 'Generate a comprehensive mission report' })
  @ApiResponse({
    status: 200,
    description: 'Mission report generated',
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async generateReport(@Body() dto: GenerateReportDto) {
    const { data: mission, error } = await this.aiService['supabase'].client
      .from('missions')
      .select('*')
      .eq('id', dto.mission_id)
      .single();

    if (error || !mission) {
      throw new BadRequestException(`Mission not found: ${dto.mission_id}`);
    }

    const input: ReportInput = {
      mission_id: dto.mission_id,
      mission_name: mission.name || mission.mission_name || 'Unknown Mission',
      objective: mission.objective || '',
      status: mission.status || 'UNKNOWN',
      plan: mission.plan || null,
      trajectory: mission.trajectory || null,
      risk_assessment: mission.risk_assessment || null,
      simulation_result: mission.simulation_result || null,
      anomalies: mission.anomalies || [],
    };

    const result = await this.aiService.generateReport(input);
    return this.schemaValidation.validateMissionReport(result);
  }

  @Get('providers')
  @ApiOperation({ summary: 'List available AI providers and their status' })
  @ApiResponse({ status: 200, description: 'Providers listed' })
  async listProviders() {
    const providers = [
      { name: 'ollama', envVar: 'OLLAMA_BASE_URL' },
      { name: 'groq', envVar: 'GROQ_API_KEY' },
      { name: 'gemini', envVar: 'GEMINI_API_KEY' },
      { name: 'openai', envVar: 'OPENAI_API_KEY' },
    ];

    const result = providers.map((p) => ({
      name: p.name,
      configured: !!process.env[p.envVar],
    }));

    const activeProvider = result.find((p) => p.configured);

    return {
      providers: result,
      active: activeProvider?.name || null,
    };
  }
}
