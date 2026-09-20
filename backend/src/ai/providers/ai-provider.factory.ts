import { AIProvider } from './ai-provider';
import { GroqProvider } from './groq.provider';
import { GeminiProvider } from './gemini.provider';
import { OpenAIProvider } from './openai.provider';
import { OllamaProvider } from './ollama.provider';

export class AIProviderFactory {
  static create(
    provider: string,
    apiKey: string,
    options?: Record<string, unknown>,
  ): AIProvider {
    switch (provider.toLowerCase()) {
      case 'groq':
        return new GroqProvider(apiKey, options?.model as string);
      case 'gemini':
        return new GeminiProvider(apiKey, options?.model as string);
      case 'openai':
        return new OpenAIProvider(
          apiKey,
          options?.model as string,
          options?.baseUrl as string,
        );
      case 'ollama':
        return new OllamaProvider(
          (options?.baseUrl as string) || 'http://localhost:11434',
          (options?.model as string) || 'llama3.1',
          apiKey || undefined,
        );
      default:
        throw new Error(
          `Unknown AI provider: ${provider}. Supported: groq, gemini, openai, ollama`,
        );
    }
  }
}
