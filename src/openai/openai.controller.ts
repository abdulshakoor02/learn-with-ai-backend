import { Controller, Post, Body, Get } from '@nestjs/common';
import { OpenaiService } from './openai.service';

@Controller('openai')
export class OpenaiController {
  constructor(private readonly openaiService: OpenaiService) {}

  @Post('chat')
  async generateChatResponse(
    @Body()
    body: {
      messages: Array<{
        role: 'user' | 'assistant' | 'system';
        content: string;
      }>;
    },
  ) {
    return this.openaiService.generateChatResponse(body.messages);
  }

  @Post('text')
  async generateText(@Body() body: { prompt: string }) {
    return this.openaiService.generateText(body.prompt);
  }

  @Post('embedding')
  async createEmbedding(@Body() body: { text: string }) {
    return this.openaiService.createEmbedding(body.text);
  }

  @Get('models')
  async listModels() {
    return this.openaiService.listModels();
  }

  @Post('json')
  async generateJSON(
    @Body()
    body: {
      messages: Array<{
        role: 'user' | 'assistant' | 'system';
        content: string;
      }>;
      schema?: {
        type: string;
        properties?: Record<string, any>;
        required?: string[];
      };
    },
  ) {
    return this.openaiService.generateJSON(body.messages, body.schema);
  }

  @Post('json/validate')
  async validateAndGenerateJSON(
    @Body()
    body: {
      messages: Array<{
        role: 'user' | 'assistant' | 'system';
        content: string;
      }>;
      schema: {
        type: string;
        properties?: Record<string, any>;
        required?: string[];
      };
    },
  ) {
    return this.openaiService.validateAndGenerateJSON(
      body.messages,
      body.schema,
    );
  }
}
