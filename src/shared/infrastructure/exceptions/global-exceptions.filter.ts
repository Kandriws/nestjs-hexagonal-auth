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
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let data: any;
    let code: string | undefined;

    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, response);
    }

    if (exception instanceof DomainException) {
      ({ status, message, code, data } = this.handleDomainException(exception));
    } else if (this.isGenericError(exception)) {
      ({ message, code } = this.handleGenericError(
        exception as Error & { code?: string },
      ));
    }

    response.status(status).json(ResponseFactory.error(message, data, code));
  }

  private handleHttpException(exception: HttpException, response: Response) {
    const status = exception.getStatus();
    const res = exception.getResponse();
    let message = exception.message || exception.name;
    let data: any;
    let code: string | undefined;

    if (typeof res === 'string') {
      message = res;
    } else if (typeof res === 'object' && res !== null) {
      const resObj = res as Record<string, any>;

      if (Array.isArray(resObj.message)) {
        return response
          .status(status)
          .json(
            ResponseFactory.error(
              'Validation error',
              resObj.message,
              'INPUT_VALIDATION_FAILED',
            ),
          );
      }

      message = resObj.message ?? resObj.error ?? message;
      code = resObj.code;
    }

    response.status(status).json(ResponseFactory.error(message, data, code));
  }

  private handleDomainException(exception: DomainException) {
    return {
      status: exception.statusCode,
      message: exception.message,
      code: exception.code,
      data: (exception as any).data,
    };
  }

  private handleGenericError(exception: Error & { code?: string }) {
    return {
      message: exception.message,
      code: exception.code,
    };
  }

  private isGenericError(
    exception: unknown,
  ): exception is Error & { code?: string } {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'message' in exception
    );
  }
}
