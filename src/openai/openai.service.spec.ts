import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OpenaiService } from './openai.service';
import OpenAI from 'openai';

describe('OpenaiService', () => {
  let service: OpenaiService | null = null;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockOpenAIClient = {
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
    completions: {
      create: jest.fn(),
    },
    embeddings: {
      create: jest.fn(),
    },
    models: {
      list: jest.fn(),
    },
  };

  beforeEach(async () => {
    // Mock ConfigService to provide API key for testing
    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'OPENAI_API_KEY') return 'test-api-key';
      if (key === 'OPENAI_BASE_URL') return 'https://api.openai.com/v1';
      if (key === 'OPENAI_MODEL') return 'gpt-3.5-turbo';
      return undefined;
    });

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        OpenaiService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<OpenaiService>(OpenaiService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    service = null;
  });

  describe('constructor', () => {
    it('should throw error if OPENAI_API_KEY is not provided', () => {
      // Create a fresh config service mock that returns undefined for API key
      const emptyConfigService = {
        get: jest.fn().mockReturnValue(undefined),
      };

      expect(() => {
        new OpenaiService(emptyConfigService as any);
      }).toThrow('OPENAI_API_KEY is required');
    });

    it('should initialize with valid API key', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'OPENAI_API_KEY') return 'test-api-key';
        return undefined;
      });

      expect(() => {
        new OpenaiService(configService);
      }).not.toThrow();
    });

    it('should use custom base URL when provided', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'OPENAI_API_KEY') return 'test-api-key';
        if (key === 'OPENAI_BASE_URL') return 'https://custom-api.com/v1';
        return undefined;
      });

      expect(() => {
        new OpenaiService(configService);
      }).not.toThrow();
    });
  });

  describe('generateChatResponse', () => {
    it('should handle successful response', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'OPENAI_API_KEY') return 'test-api-key';
        return undefined;
      });

      const serviceWithMock = new OpenaiService(configService);

      // Mock the OpenAI client's chat completions method
      const mockOpenAIClient = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{ message: { content: 'Test response' } }],
              usage: { total_tokens: 100 },
              model: 'gpt-3.5-turbo',
            }),
          },
        },
      };

      serviceWithMock['openai'] = mockOpenAIClient as unknown as OpenAI;

      const messages = [{ role: 'user' as const, content: 'Hello' }];
      const result = await serviceWithMock.generateChatResponse(messages);

      expect(result.success).toBe(true);
      expect(result.data).toBe('Test response');
      expect(result.usage.total_tokens).toBe(100);
      expect(result.model).toBe('gpt-3.5-turbo');
    });

    it('should handle errors gracefully', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'OPENAI_API_KEY') return 'test-api-key';
        return undefined;
      });

      const serviceWithMock = new OpenaiService(configService);

      // Mock the OpenAI client's chat completions method to throw an error
      const mockOpenAIClient = {
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('API Error')),
          },
        },
      };

      serviceWithMock['openai'] = mockOpenAIClient as unknown as OpenAI;

      const messages = [{ role: 'user' as const, content: 'Hello' }];
      const result = await serviceWithMock.generateChatResponse(messages);

      expect(result.success).toBe(false);
      expect(result.error).toBe('API Error');
    });
  });

  describe('generateJSON', () => {
    it('should generate valid JSON response with schema', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'OPENAI_API_KEY') return 'test-api-key';
        return undefined;
      });

      const serviceWithMock = new OpenaiService(configService);

      mockOpenAIClient.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: '{ "name": "John", "age": 30 }' } }],
        usage: { total_tokens: 50 },
        model: 'gpt-3.5-turbo',
      });

      serviceWithMock['openai'] = mockOpenAIClient as unknown as OpenAI;

      const messages = [{ role: 'user' as const, content: 'Get user data' }];
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
      };

      const result = await serviceWithMock.generateJSON(messages, schema);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'John', age: 30 });
      expect(result.usage.total_tokens).toBe(50);
    });

    it('should handle invalid JSON response', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'OPENAI_API_KEY') return 'test-api-key';
        return undefined;
      });

      const serviceWithMock = new OpenaiService(configService);

      mockOpenAIClient.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'This is not valid JSON' } }],
        usage: { total_tokens: 50 },
        model: 'gpt-3.5-turbo',
      });

      serviceWithMock['openai'] = mockOpenAIClient as unknown as OpenAI;

      const messages = [{ role: 'user' as const, content: 'Get data' }];
      const result = await serviceWithMock.generateJSON(messages);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to parse JSON response from AI');
    });

    it('should extract JSON from markdown code blocks', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'OPENAI_API_KEY') return 'test-api-key';
        return undefined;
      });

      const serviceWithMock = new OpenaiService(configService);

      mockOpenAIClient.chat.completions.create.mockResolvedValue({
        choices: [
          { message: { content: '```json\n{ "result": "success" }\n```' } },
        ],
        usage: { total_tokens: 50 },
        model: 'gpt-3.5-turbo',
      });

      serviceWithMock['openai'] = mockOpenAIClient as unknown as OpenAI;

      const messages = [{ role: 'user' as const, content: 'Get result' }];
      const result = await serviceWithMock.generateJSON(messages);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ result: 'success' });
    });
  });

  describe('validateAndGenerateJSON', () => {
    it('should call generateJSON with provided schema', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'OPENAI_API_KEY') return 'test-api-key';
        return undefined;
      });

      const serviceWithMock = new OpenaiService(configService);

      mockOpenAIClient.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: '{ "validated": true }' } }],
        usage: { total_tokens: 40 },
        model: 'gpt-3.5-turbo',
      });

      serviceWithMock['openai'] = mockOpenAIClient as unknown as OpenAI;

      const messages = [{ role: 'user' as const, content: 'Validate data' }];
      const schema = {
        type: 'object',
        properties: { validated: { type: 'boolean' } },
        required: ['validated'],
      };

      const result = await serviceWithMock.validateAndGenerateJSON(
        messages,
        schema,
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ validated: true });
    });
  });
});
