import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from 'src/shared/infrastructure/controllers/health.controller';
import { HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: jest.Mocked<HealthCheckService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn().mockResolvedValue({
              status: 'ok',
              details: { database: { status: 'up' } },
            }),
          },
        },
        {
          provide: PrismaHealthIndicator,
          useValue: {
            pingCheck: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get(HealthCheckService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /health/live', () => {
    it('should return ok status', () => {
      const result = controller.live();
      expect(result).toEqual({ status: 'ok' });
    });
  });

  describe('GET /health/ready', () => {
    it('should delegate to HealthCheckService', async () => {
      const result = await controller.ready();

      expect(healthCheckService.check).toHaveBeenCalledTimes(1);
      expect(result.status).toBe('ok');
    });
  });
});
