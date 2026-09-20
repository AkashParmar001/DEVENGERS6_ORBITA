import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('HealthService', () => {
  let service: HealthService;
  let mockSupabaseService: any;

  beforeEach(async () => {
    mockSupabaseService = {
      client: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ error: null }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return health status', async () => {
      const result = await service.checkHealth();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(typeof result.uptime).toBe('number');
    });
  });

  describe('checkReady', () => {
    it('should return ready when database is accessible', async () => {
      mockSupabaseService.client.limit.mockResolvedValue({ error: null });

      const result = await service.checkReady();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('database', 'connected');
    });

    it('should return not_ready when database has error', async () => {
      mockSupabaseService.client.limit.mockResolvedValue({
        error: { message: 'Connection refused' },
      });

      const result = await service.checkReady();
      expect(result).toHaveProperty('status', 'not_ready');
      expect(result).toHaveProperty('database', 'unavailable');
    });
  });
});
