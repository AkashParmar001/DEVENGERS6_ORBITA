import { Injectable, Logger } from '@nestjs/common';
import { AIProvider } from './ai-provider';
import type {
  AIChatMessage,
  AIToolDefinition,
  AIResponse,
} from './ai-provider';

@Injectable()
export class GeminiProvider extends AIProvider {
  readonly name = 'gemini';
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey: string, model: string = 'gemini-2.0-flash') {
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
    // Convert OpenAI format to Gemini format
    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content || '' }],
      }));

    const generationConfig: Record<string, unknown> = {
      temperature: options?.temperature ?? 0.1,
      maxOutputTokens: options?.max_tokens ?? 4096,
    };

    const toolsPayload = tools?.length
      ? {
          function_declarations: tools.map((t) => ({
            name: t.function.name,
            description: t.function.description,
            parameters: t.function.parameters,
          })),
        }
      : undefined;

    const body: Record<string, unknown> = {
      contents,
      generationConfig,
    };
    if (toolsPayload) body.tools = [toolsPayload];

    const systemMsg = messages.find((m) => m.role === 'system');
    if (systemMsg) {
      body.systemInstruction = { parts: [{ text: systemMsg.content }] };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const text = await resp.text();
      this.logger.error(`Gemini API error: ${resp.status} ${text}`);
      throw new Error(`Gemini API error: ${resp.status}`);
    }

    const data = (await resp.json()) as any;
    const candidate = data.candidates?.[0];
    const part = candidate?.content?.parts?.[0];

    const toolCalls = (
      part?.functionCall
        ? [
            {
              id: `call_${Date.now()}`,
              type: 'function' as const,
              function: {
                name: part.functionCall.name,
                arguments: JSON.stringify(part.functionCall.args || {}),
              },
            },
          ]
        : []
    ) as any[];

    return {
      content: part?.text ?? null,
      tool_calls: toolCalls,
      finish_reason: candidate?.finishReason ?? 'stop',
      usage: data.usageMetadata
        ? {
            prompt_tokens: data.usageMetadata.promptTokenCount ?? 0,
            completion_tokens: data.usageMetadata.candidatesTokenCount ?? 0,
            total_tokens: data.usageMetadata.totalTokenCount ?? 0,
          }
        : undefined,
    };
  }
}
