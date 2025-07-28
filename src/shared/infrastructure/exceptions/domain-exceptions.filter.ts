import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../../domain/exceptions/domain.exception';

@Catch(DomainException)
export class DomainExceptionsFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    response.status(exception.statusCode).json({
      statusCode: exception.statusCode,
      message: exception.message,
      errorCode: exception.code,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
