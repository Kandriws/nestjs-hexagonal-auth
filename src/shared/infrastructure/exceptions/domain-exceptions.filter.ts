import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { ResponseFactory } from '../dto';

@Catch(DomainException)
export class DomainExceptionsFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.statusCode;
    const message = exception.message;
    const code = exception.code;
    const data = (exception as any).data;

    response.status(status).json(ResponseFactory.error(message, data, code));
  }
}
