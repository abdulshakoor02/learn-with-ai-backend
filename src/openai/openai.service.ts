import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService {
  private openai: OpenAI;
  public model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    const baseURL = this.configService.get<string>('OPENAI_BASE_URL');
    this.model = this.configService.get<string>('OPENAI_MODEL')!;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required');
    }

    this.openai = new OpenAI({
      apiKey,
      baseURL: baseURL || undefined,
    });
  }

  async generateChatResponse(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  ) {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: 150,
        temperature: 0.7,
      });

      return {
        success: true,
        data: response.choices[0]?.message?.content || 'No response generated',
        usage: response.usage,
        model: response.model,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async generateText(prompt: string) {
    try {
      const response = await this.openai.completions.create({
        model: this.model,
        prompt,
        max_tokens: 150,
        temperature: 0.7,
      });

      return {
        success: true,
        data: response.choices[0]?.text || 'No text generated',
        usage: response.usage,
        model: response.model,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async createEmbedding(text: string) {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });

      return {
        success: true,
        data: response.data[0]?.embedding || [],
        usage: response.usage,
        model: response.model,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async listModels() {
    try {
      const response = await this.openai.models.list();
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async generateJSON<T = any>(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    schema?: object,
  ): Promise<{
    success: boolean;
    data?: T;
    usage?: any;
    model?: string;
    error?: string;
  }> {
    try {
      const systemMessage = `You teaching planner that returns JSON data.
Please strictly respond with valid JSON that matches this schema:
{
"title":"what is the topic to learn",
"duration":"duration in weeks for complete course",
"prerequisites":["array of prerequisites"],
"phases":[{
"focus":"phase of learning",
"duration":"duration in weeks just the number",
"topics":["each detailed description of topics for this phase can be used as context for further usage"],
}]
}

Only return the JSON object, no additional text.`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'system', content: systemMessage }, ...messages],
        max_tokens: 100000,
        response_format: { type: 'json_object' },
        temperature: 0.5,
      });

      const content = response.choices[0]?.message?.content || '';

      try {
        const jsonData =
          content.trim().startsWith('{') || content.trim().startsWith('[')
            ? (JSON.parse(content.trim()) as T)
            : (JSON.parse(
                content.split('```json')[1]?.split('```')[0] || content,
              ) as T);

        return {
          success: true,
          data: jsonData,
          usage: response.usage,
          model: response.model,
        };
      } catch {
        return {
          success: false,
          error: 'Failed to parse JSON response from AI',
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async validateAndGenerateJSON<T = any>(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    schema: {
      type: string;
      properties?: Record<string, any>;
      required?: string[];
    },
  ): Promise<{
    success: boolean;
    data?: T;
    usage?: any;
    model?: string;
    error?: string;
  }> {
    return this.generateJSON(messages, schema);
  }
}
