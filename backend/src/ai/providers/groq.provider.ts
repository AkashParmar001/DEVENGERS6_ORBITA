import { Injectable, Logger } from '@nestjs/common';
import { AIProvider } from './ai-provider';
import type {
  AIChatMessage,
  AIToolDefinition,
  AIResponse,
} from './ai-provider';

@Injectable()
export class GroqProvider extends AIProvider {
  readonly name = 'groq';
  private readonly logger = new Logger(GroqProvider.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.groq.com/openai/v1';
  private readonly model: string;

  constructor(apiKey: string, model: string = 'llama-3.3-70b-versatile') {
    super();
    this.apiKey = apiKey;
    this.model = model;
  }

  async chat(
    messages: AIChatMessage[],
    tools?: AIToolDefinition[],
    options?: {
      temperature?: number;
      max_tokens?: number;
      tool_choice?: string;
    },
  ): Promise<AIResponse> {
    const body: Record<string, unknown> = {
      model: this.model,
      messages,
      temperature: options?.temperature ?? 0.1,
      max_tokens: options?.max_tokens ?? 4096,
    };

    if (tools && tools.length > 0) {
      body.tools = tools;
      body.tool_choice = options?.tool_choice ?? 'auto';
    }

    const resp = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const text = await resp.text();
      this.logger.error(`Groq API error: ${resp.status} ${text}`);
      throw new Error(`Groq API error: ${resp.status}`);
    }

    const data = (await resp.json()) as any;
    const choice = data.choices?.[0];
    return {
      content: choice?.message?.content ?? null,
      tool_calls: choice?.message?.tool_calls ?? [],
      finish_reason: choice?.finish_reason ?? 'stop',
      usage: data.usage,
    };
  }
}
