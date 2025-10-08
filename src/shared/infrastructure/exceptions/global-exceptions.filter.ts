import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseFactory } from '../dto/response.factory';
import { DomainException } from '../../domain/exceptions/domain.exception';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let data: any = undefined;
    let code: string | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (res && typeof res === 'object') {
        if (Array.isArray((res as any).message)) {
          message = 'Validation error';
          data = (res as any).message as string[];
          response.status(status).json(ResponseFactory.error(message, data));
          return;
        } else if ((res as any).message) {
          message = (res as any).message;
        } else if ((res as any).error) {
          message = (res as any).error;
        } else {
          message = exception.message || exception.name;
        }

        if ((res as any).code) {
          code = (res as any).code;
        }
      } else {
        message = exception.message || exception.name;
      }
    } else if (exception instanceof DomainException) {
      status = exception.statusCode;
      message = exception.message;
      code = exception.code;
    } else if (exception && exception.message) {
      message = exception.message;
      if ((exception as any).code) code = (exception as any).code;
    }

    response.status(status).json(ResponseFactory.error(message, data, code));
  }
}
