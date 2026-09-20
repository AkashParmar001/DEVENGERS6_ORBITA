export interface AIChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  tool_calls?: AIToolCall[];
}

export interface AIToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

export interface AIToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface AIResponse {
  content: string | null;
  tool_calls: AIToolCall[];
  finish_reason: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export abstract class AIProvider {
  abstract readonly name: string;

  abstract chat(
    messages: AIChatMessage[],
    tools?: AIToolDefinition[],
    options?: {
      temperature?: number;
      max_tokens?: number;
      tool_choice?: string;
    },
  ): Promise<AIResponse>;
}
