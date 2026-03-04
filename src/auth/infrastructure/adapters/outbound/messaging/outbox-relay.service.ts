import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';

/**
 * Polls the OutboxEvent table for PENDING events and marks them PUBLISHED.
 *
 * In Phase 2, when a real message broker (RabbitMQ / SQS) is wired,
 * this relay will forward each event before marking it published.
 * For now it simply transitions PENDING → PUBLISHED to exercise the
 * full outbox lifecycle and prove the plumbing works.
 */
@Injectable()
export class OutboxRelayService {
  private readonly logger = new Logger(OutboxRelayService.name);

  /** Maximum publish attempts before marking as FAILED */
  private static readonly MAX_ATTEMPTS = 5;

  /** Batch size per poll */
  private static readonly BATCH_SIZE = 50;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Runs every 5 seconds. Fetches PENDING events whose nextAttemptAt
   * is null or in the past, and processes them.
   */
  @Cron(CronExpression.EVERY_5_SECONDS)
  async relay(): Promise<void> {
    const events = await this.prisma.outboxEvent.findMany({
      where: {
        status: 'PENDING',
        OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: new Date() } }],
      },
      orderBy: { createdAt: 'asc' },
      take: OutboxRelayService.BATCH_SIZE,
    });

    if (events.length === 0) return;

    this.logger.debug(`Relaying ${events.length} outbox event(s)`);

    for (const event of events) {
      try {
        // TODO Phase 2: forward to RabbitMQ / SQS here
        await this.markPublished(event.id);
      } catch (error) {
        await this.handleFailure(event.id, event.attempts, error);
      }
    }
  }

  private async markPublished(eventId: string): Promise<void> {
    await this.prisma.outboxEvent.update({
      where: { id: eventId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        attempts: { increment: 1 },
      },
    });
  }

  private async handleFailure(
    eventId: string,
    currentAttempts: number,
    error: unknown,
  ): Promise<void> {
    const nextAttempt = currentAttempts + 1;
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (nextAttempt >= OutboxRelayService.MAX_ATTEMPTS) {
      this.logger.error(
        `Outbox event ${eventId} reached max attempts (${OutboxRelayService.MAX_ATTEMPTS}), marking FAILED: ${errorMessage}`,
      );
      await this.prisma.outboxEvent.update({
        where: { id: eventId },
        data: {
          status: 'FAILED',
          attempts: nextAttempt,
          errorMessage,
        },
      });
      return;
    }

    // Exponential back-off: 2^attempt * 5 seconds
    const delayMs = Math.pow(2, nextAttempt) * 5_000;
    const nextAttemptAt = new Date(Date.now() + delayMs);

    this.logger.warn(
      `Outbox event ${eventId} attempt ${nextAttempt} failed, retrying at ${nextAttemptAt.toISOString()}: ${errorMessage}`,
    );

    await this.prisma.outboxEvent.update({
      where: { id: eventId },
      data: {
        attempts: nextAttempt,
        nextAttemptAt,
        errorMessage,
      },
    });
  }
}
