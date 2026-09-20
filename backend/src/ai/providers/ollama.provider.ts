import { Injectable, Logger } from '@nestjs/common';
import { AIProvider } from './ai-provider';
import type {
  AIChatMessage,
  AIToolDefinition,
  AIResponse,
} from './ai-provider';

@Injectable()
export class OllamaProvider extends AIProvider {
  readonly name = 'ollama';
  private readonly logger = new Logger(OllamaProvider.name);
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly apiKey?: string;

  constructor(
    baseUrl: string = 'http://localhost:11434',
    model: string = 'llama3.1',
    apiKey?: string,
  ) {
    super();
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.model = model;
    this.apiKey = apiKey;
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

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    let resp: Response;
    try {
      resp = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(60_000),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes('ECONNREFUSED') ||
        msg.includes('fetch failed') ||
        msg.includes('ENOTFOUND')
      ) {
        this.logger.error(
          `Cannot connect to Ollama at ${this.baseUrl}. Is Ollama running?`,
        );
        throw new Error(
          `Ollama connection failed: server not reachable at ${this.baseUrl}`,
        );
      }
      if (msg.includes('timeout') || msg.includes('aborted')) {
        this.logger.error(`Ollama request timed out after 60s`);
        throw new Error('Ollama request timed out');
      }
      this.logger.error(`Ollama request failed: ${msg}`);
      throw new Error(`Ollama request failed: ${msg}`);
    }

    if (!resp.ok) {
      const text = await resp.text();
      if (resp.status === 404) {
        this.logger.error(
          `Ollama model not found: ${this.model}. Pull it with: ollama pull ${this.model}`,
        );
        throw new Error(
          `Ollama model "${this.model}" not found. Pull it with: ollama pull ${this.model}`,
        );
      }
      this.logger.error(`Ollama API error: ${resp.status} ${text}`);
      throw new Error(`Ollama API error: ${resp.status}`);
    }

    let data: Record<string, unknown>;
    try {
      data = (await resp.json()) as Record<string, unknown>;
    } catch {
      this.logger.error('Ollama returned malformed JSON');
      throw new Error('Ollama returned malformed JSON response');
    }

    const choices = data.choices as any[] | undefined;
    const choice = choices?.[0];
    if (!choice) {
      this.logger.error('Ollama returned empty response (no choices)');
      throw new Error('Ollama returned empty response');
    }

    const message = choice.message;
    if (!message) {
      this.logger.error('Ollama response missing message field');
      throw new Error('Ollama response missing message field');
    }

    return {
      content: message.content ?? null,
      tool_calls: message.tool_calls ?? [],
      finish_reason: choice.finish_reason ?? 'stop',
      usage: data.usage as AIResponse['usage'],
    };
  }
}
