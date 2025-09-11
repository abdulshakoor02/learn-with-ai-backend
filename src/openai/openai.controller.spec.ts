import { Test, TestingModule } from '@nestjs/testing';
import { OpenaiController } from './openai.controller';
import { OpenaiService } from './openai.service';
import { ConfigModule } from '@nestjs/config';

describe('OpenaiController', () => {
  let controller: OpenaiController;
  let service: OpenaiService;

  const mockOpenaiService = {
    generateChatResponse: jest.fn(),
    generateText: jest.fn(),
    createEmbedding: jest.fn(),
    listModels: jest.fn(),
    generateJSON: jest.fn(),
    validateAndGenerateJSON: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      controllers: [OpenaiController],
      providers: [
        {
          provide: OpenaiService,
          useValue: mockOpenaiService,
        },
      ],
    }).compile();

    controller = module.get<OpenaiController>(OpenaiController);
    service = module.get<OpenaiService>(OpenaiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generateChatResponse', () => {
    it('should call openaiService.generateChatResponse with correct parameters', async () => {
      const mockMessages = [{ role: 'user' as const, content: 'Hello' }];
      const mockResponse = { success: true, data: 'Hello world' };

      mockOpenaiService.generateChatResponse.mockResolvedValue(mockResponse);

      const result = await controller.generateChatResponse({
        messages: mockMessages,
      });

      expect(result).toEqual(mockResponse);
      expect(service.generateChatResponse).toHaveBeenCalledWith(mockMessages);
    });

    it('should handle errors from openaiService', async () => {
      const mockMessages = [{ role: 'user' as const, content: 'Hello' }];
      const mockErrorResponse = { success: false, error: 'API error' };

      mockOpenaiService.generateChatResponse.mockResolvedValue(
        mockErrorResponse,
      );

      const result = await controller.generateChatResponse({
        messages: mockMessages,
      });

      expect(result).toEqual(mockErrorResponse);
    });
  });

  describe('generateText', () => {
    it('should call openaiService.generateText with correct parameters', async () => {
      const mockPrompt = 'Write a story';
      const mockResponse = { success: true, data: 'Once upon a time...' };

      mockOpenaiService.generateText.mockResolvedValue(mockResponse);

      const result = await controller.generateText({ prompt: mockPrompt });

      expect(result).toEqual(mockResponse);
      expect(service.generateText).toHaveBeenCalledWith(mockPrompt);
    });
  });

  describe('createEmbedding', () => {
    it('should call openaiService.createEmbedding with correct parameters', async () => {
      const mockText = 'Sample text';
      const mockEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5];
      const mockResponse = { success: true, data: mockEmbedding };

      mockOpenaiService.createEmbedding.mockResolvedValue(mockResponse);

      const result = await controller.createEmbedding({ text: mockText });

      expect(result).toEqual(mockResponse);
      expect(service.createEmbedding).toHaveBeenCalledWith(mockText);
    });
  });

  describe('listModels', () => {
    it('should call openaiService.listModels', async () => {
      const mockModels = [{ id: 'gpt-3.5-turbo', object: 'model' }];
      const mockResponse = { success: true, data: mockModels };

      mockOpenaiService.listModels.mockResolvedValue(mockResponse);

      const result = await controller.listModels();

      expect(result).toEqual(mockResponse);
      expect(service.listModels).toHaveBeenCalled();
    });
  });

  describe('generateJSON', () => {
    it('should call openaiService.generateJSON with correct parameters', async () => {
      const mockMessages = [
        { role: 'user' as const, content: 'Get user data' },
      ];
      const mockSchema = {
        type: 'object',
        properties: { name: { type: 'string' } },
      };
      const mockResponse = {
        success: true,
        data: { name: 'John Doe', age: 30 },
      };

      mockOpenaiService.generateJSON.mockResolvedValue(mockResponse);

      const result = await controller.generateJSON({
        messages: mockMessages,
        schema: mockSchema,
      });

      expect(result).toEqual(mockResponse);
      expect(service.generateJSON).toHaveBeenCalledWith(
        mockMessages,
        mockSchema,
      );
    });

    it('should work without schema parameter', async () => {
      const mockMessages = [
        { role: 'user' as const, content: 'Get user data' },
      ];
      const mockResponse = {
        success: true,
        data: { any: 'json' },
      };

      mockOpenaiService.generateJSON.mockResolvedValue(mockResponse);

      const result = await controller.generateJSON({ messages: mockMessages });

      expect(result).toEqual(mockResponse);
      expect(service.generateJSON).toHaveBeenCalledWith(
        mockMessages,
        undefined,
      );
    });
  });

  describe('validateAndGenerateJSON', () => {
    it('should call openaiService.validateAndGenerateJSON with schema validation', async () => {
      const mockMessages = [
        { role: 'system' as const, content: 'Create user profile' },
      ];
      const mockSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
        },
        required: ['name', 'email'],
      };
      const mockResponse = {
        success: true,
        data: { name: 'Jane Smith', email: 'jane@example.com' },
      };

      mockOpenaiService.validateAndGenerateJSON.mockResolvedValue(mockResponse);

      const result = await controller.validateAndGenerateJSON({
        messages: mockMessages,
        schema: mockSchema,
      });

      expect(result).toEqual(mockResponse);
      expect(service.validateAndGenerateJSON).toHaveBeenCalledWith(
        mockMessages,
        mockSchema,
      );
    });
  });
});
