import { ConsoleLogger, LogLevel } from '@nestjs/common';
import { getCorrelationId } from '../context/request-context';
import { envs } from '../config/env.config';

/**
 * Structured logger that outputs JSON in production and human-readable
 * format in development. Includes correlation ID from the async context.
 */
export class StructuredLogger extends ConsoleLogger {
  private readonly useJson: boolean;

  constructor(context?: string) {
    super(context ?? '');
    this.useJson = envs.app.isProduction;
  }

  protected formatMessage(
    logLevel: LogLevel,
    message: unknown,
    _pidMessage: string,
    _formattedLogLevel: string,
    contextMessage: string,
    _timestampDiff: string,
  ): string {
    if (!this.useJson) {
      // In development, delegate to the default NestJS formatting
      return super.formatMessage(
        logLevel,
        message,
        _pidMessage,
        _formattedLogLevel,
        contextMessage,
        _timestampDiff,
      );
    }

    const entry = {
      timestamp: new Date().toISOString(),
      level: logLevel,
      correlationId: getCorrelationId(),
      context: contextMessage.trim()
        ? contextMessage.replace(/[\[\]]/g, '').trim()
        : undefined,
      message: typeof message === 'string' ? message : JSON.stringify(message),
    };

    return JSON.stringify(entry) + '\n';
  }
}
