import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { SupabaseService } from '../supabase/supabase.service';
import { AIProviderFactory } from './providers/ai-provider.factory';
import type { AIProvider, AIChatMessage } from './providers/ai-provider';
import type {
  MissionPlanResponse,
  AnomalyInput,
  AnomalyAnalysis,
  RiskInput,
  RiskExplanation,
  ReportInput,
  MissionReport,
  AIRunLog,
} from './ai.types';
import {
  MISSION_PLANNER_SYSTEM_PROMPT,
  MISSION_PLAN_SCHEMA,
} from './prompts/mission-planner';
import {
  ANOMALY_ANALYSIS_PROMPT,
  ANOMALY_ANALYSIS_SCHEMA,
} from './prompts/anomaly-analysis';
import {
  RISK_ANALYSIS_PROMPT,
  RISK_ANALYSIS_SCHEMA,
} from './prompts/risk-analysis';
import {
  REPORT_GENERATOR_PROMPT,
  REPORT_GENERATOR_SCHEMA,
} from './prompts/report-generator';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly supabase: SupabaseService,
  ) {}

  getProvider(name?: string): AIProvider {
    const ollamaBaseUrl = this.config.get<string>('OLLAMA_BASE_URL');
    const ollamaModel = this.config.get<string>('OLLAMA_MODEL');
    const ollamaApiKey = this.config.get<string>('OLLAMA_API_KEY');
    const groqApiKey = this.config.get<string>('GROQ_API_KEY');
    const geminiApiKey = this.config.get<string>('GEMINI_API_KEY');
    const openaiApiKey = this.config.get<string>('OPENAI_API_KEY');

    const providerName = name?.toLowerCase();

    if (providerName) {
      return this.createProviderByName(
        providerName,
        ollamaBaseUrl,
        ollamaModel,
        ollamaApiKey,
        groqApiKey,
        geminiApiKey,
        openaiApiKey,
      );
    }

    if (ollamaBaseUrl) {
      return AIProviderFactory.create('ollama', ollamaApiKey || '', {
        baseUrl: ollamaBaseUrl,
        model: ollamaModel || 'llama3.1',
      });
    }

    if (groqApiKey) {
      return AIProviderFactory.create('groq', groqApiKey);
    }

    if (geminiApiKey) {
      return AIProviderFactory.create('gemini', geminiApiKey);
    }

    if (openaiApiKey) {
      return AIProviderFactory.create('openai', openaiApiKey);
    }

    throw new BadRequestException(
      'No AI provider configured. Set OLLAMA_BASE_URL, GROQ_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY.',
    );
  }

  private createProviderByName(
    name: string,
    ollamaBaseUrl?: string,
    ollamaModel?: string,
    ollamaApiKey?: string,
    groqApiKey?: string,
    geminiApiKey?: string,
    openaiApiKey?: string,
  ): AIProvider {
    switch (name) {
      case 'ollama': {
        if (!ollamaBaseUrl && !ollamaApiKey) {
          throw new BadRequestException(
            'Ollama not configured. Set OLLAMA_BASE_URL environment variable.',
          );
        }
        return AIProviderFactory.create('ollama', ollamaApiKey || '', {
          baseUrl: ollamaBaseUrl || 'http://localhost:11434',
          model: ollamaModel || 'llama3.1',
        });
      }
      case 'groq': {
        if (!groqApiKey) {
          throw new BadRequestException(
            'Groq not configured. Set GROQ_API_KEY environment variable.',
          );
        }
        return AIProviderFactory.create('groq', groqApiKey);
      }
      case 'gemini': {
        if (!geminiApiKey) {
          throw new BadRequestException(
            'Gemini not configured. Set GEMINI_API_KEY environment variable.',
          );
        }
        return AIProviderFactory.create('gemini', geminiApiKey);
      }
      case 'openai': {
        if (!openaiApiKey) {
          throw new BadRequestException(
            'OpenAI not configured. Set OPENAI_API_KEY environment variable.',
          );
        }
        return AIProviderFactory.create('openai', openaiApiKey);
      }
      default:
        throw new BadRequestException(
          `Unknown AI provider: ${name}. Supported: ollama, groq, gemini, openai`,
        );
    }
  }

  async generateStructured<T>(
    provider: AIProvider,
    messages: AIChatMessage[],
    schema: Record<string, unknown>,
    options?: { temperature?: number; max_tokens?: number },
  ): Promise<T> {
    const tools = [
      {
        type: 'function' as const,
        function: {
          name: 'return_structured_output',
          description:
            'Return the structured output matching the required schema',
          parameters: schema,
        },
      },
    ];

    let attempts = 0;
    let currentMessages: AIChatMessage[] = [...messages];
    while (attempts < 3) {
      attempts++;
      const response = await provider.chat(currentMessages, tools, {
        temperature: options?.temperature ?? 0.1,
        max_tokens: options?.max_tokens ?? 4096,
      });

      if (response.tool_calls.length > 0) {
        const toolCall = response.tool_calls[0];
        try {
          const result = JSON.parse(toolCall.function.arguments) as T;
          return result;
        } catch (err) {
          this.logger.warn(
            `Structured output parse failed (attempt ${attempts}): ${err}`,
          );
          currentMessages = [
            ...currentMessages,
            {
              role: 'assistant',
              content: '',
              tool_calls: response.tool_calls,
            },
            {
              role: 'tool',
              content: JSON.stringify({
                error: `Invalid JSON in tool call: ${err}`,
              }),
              tool_call_id: toolCall.id,
            },
          ];
        }
      } else {
        const content = response.content || '';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]) as T;
          } catch {
            // fall through
          }
        }
        throw new BadRequestException(
          'AI did not return structured output. Try rephrasing the request.',
        );
      }
    }

    throw new BadRequestException(
      'Failed to get valid structured output after 3 attempts',
    );
  }

  async generateMissionPlan(
    command: string,
    providerName?: string,
  ): Promise<MissionPlanResponse> {
    const provider = this.getProvider(providerName);
    const startTime = Date.now();

    const messages: AIChatMessage[] = [
      { role: 'system', content: MISSION_PLANNER_SYSTEM_PROMPT },
      { role: 'user', content: command },
    ];

    try {
      const result = await this.generateStructured<MissionPlanResponse>(
        provider,
        messages,
        MISSION_PLAN_SCHEMA,
      );

      await this.logRun({
        provider: provider.name,
        model: (provider as any).model || 'unknown',
        task_type: 'mission_planning',
        input_hash: createHash('sha256').update(command).digest('hex'),
        status: 'success',
        latency_ms: Date.now() - startTime,
        created_at: new Date().toISOString(),
      });

      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await this.logRun({
        provider: provider.name,
        model: (provider as any).model || 'unknown',
        task_type: 'mission_planning',
        input_hash: createHash('sha256').update(command).digest('hex'),
        status: msg.includes('timeout') ? 'timeout' : 'error',
        latency_ms: Date.now() - startTime,
        error: msg,
        created_at: new Date().toISOString(),
      });
      throw err;
    }
  }

  async analyzeAnomaly(input: AnomalyInput): Promise<AnomalyAnalysis> {
    const provider = this.getProvider();
    const startTime = Date.now();

    const userContent = JSON.stringify({
      object_id: input.object_id,
      object_name: input.object_name,
      telemetry: input.telemetry,
      anomaly: input.anomaly,
    });

    const messages: AIChatMessage[] = [
      { role: 'system', content: ANOMALY_ANALYSIS_PROMPT },
      { role: 'user', content: userContent },
    ];

    try {
      const result = await this.generateStructured<AnomalyAnalysis>(
        provider,
        messages,
        ANOMALY_ANALYSIS_SCHEMA,
      );

      await this.logRun({
        provider: provider.name,
        model: (provider as any).model || 'unknown',
        task_type: 'anomaly_analysis',
        input_hash: createHash('sha256').update(userContent).digest('hex'),
        status: 'success',
        latency_ms: Date.now() - startTime,
        created_at: new Date().toISOString(),
      });

      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await this.logRun({
        provider: provider.name,
        model: (provider as any).model || 'unknown',
        task_type: 'anomaly_analysis',
        input_hash: createHash('sha256').update(userContent).digest('hex'),
        status: msg.includes('timeout') ? 'timeout' : 'error',
        latency_ms: Date.now() - startTime,
        error: msg,
        created_at: new Date().toISOString(),
      });
      throw err;
    }
  }

  async explainRisk(input: RiskInput): Promise<RiskExplanation> {
    const provider = this.getProvider();
    const startTime = Date.now();

    const userContent = JSON.stringify(input);

    const messages: AIChatMessage[] = [
      { role: 'system', content: RISK_ANALYSIS_PROMPT },
      { role: 'user', content: userContent },
    ];

    try {
      const result = await this.generateStructured<RiskExplanation>(
        provider,
        messages,
        RISK_ANALYSIS_SCHEMA,
      );

      await this.logRun({
        provider: provider.name,
        model: (provider as any).model || 'unknown',
        task_type: 'risk_analysis',
        input_hash: createHash('sha256').update(userContent).digest('hex'),
        status: 'success',
        latency_ms: Date.now() - startTime,
        created_at: new Date().toISOString(),
      });

      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await this.logRun({
        provider: provider.name,
        model: (provider as any).model || 'unknown',
        task_type: 'risk_analysis',
        input_hash: createHash('sha256').update(userContent).digest('hex'),
        status: msg.includes('timeout') ? 'timeout' : 'error',
        latency_ms: Date.now() - startTime,
        error: msg,
        created_at: new Date().toISOString(),
      });
      throw err;
    }
  }

  async generateReport(input: ReportInput): Promise<MissionReport> {
    const provider = this.getProvider();
    const startTime = Date.now();

    const userContent = JSON.stringify(input);

    const messages: AIChatMessage[] = [
      { role: 'system', content: REPORT_GENERATOR_PROMPT },
      { role: 'user', content: userContent },
    ];

    try {
      const result = await this.generateStructured<MissionReport>(
        provider,
        messages,
        REPORT_GENERATOR_SCHEMA,
      );

      await this.logRun({
        provider: provider.name,
        model: (provider as any).model || 'unknown',
        task_type: 'report_generation',
        input_hash: createHash('sha256').update(userContent).digest('hex'),
        status: 'success',
        latency_ms: Date.now() - startTime,
        created_at: new Date().toISOString(),
      });

      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await this.logRun({
        provider: provider.name,
        model: (provider as any).model || 'unknown',
        task_type: 'report_generation',
        input_hash: createHash('sha256').update(userContent).digest('hex'),
        status: msg.includes('timeout') ? 'timeout' : 'error',
        latency_ms: Date.now() - startTime,
        error: msg,
        created_at: new Date().toISOString(),
      });
      throw err;
    }
  }

  private async logRun(run: AIRunLog): Promise<void> {
    try {
      const { error } = await this.supabase.client.from('ai_runs').insert({
        mission_id: run.mission_id || null,
        provider: run.provider,
        model: run.model,
        task_type: run.task_type,
        input_hash: run.input_hash,
        status: run.status,
        latency_ms: run.latency_ms,
        error: run.error || null,
        created_at: run.created_at,
      });
      if (error) {
        this.logger.warn(`Failed to log AI run: ${error.message}`);
      }
    } catch {
      // ai_runs table may not exist yet — silently ignore
    }
  }
}
