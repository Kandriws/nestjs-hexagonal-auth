import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/auth/infrastructure/decorators';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaHealthIndicator,
    private readonly prismaService: PrismaService,
  ) {}

  /**
   * Liveness probe — the process is running.
   * Kubernetes / Docker uses this to know if the container should be restarted.
   */
  @Get('live')
  @Public()
  @ApiOperation({ summary: 'Liveness probe' })
  live() {
    return { status: 'ok' };
  }

  /**
   * Readiness probe — the service can handle traffic.
   * Checks database connectivity.
   */
  @Get('ready')
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe' })
  ready() {
    return this.health.check([
      () => this.prisma.pingCheck('database', this.prismaService),
    ]);
  }
}
