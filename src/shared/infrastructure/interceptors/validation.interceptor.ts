import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ValidationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof BadRequestException) {
          const response: any = error.getResponse();
          const errorMessages = Array.isArray(response.message)
            ? response.message
            : [response.message];

          const formattedError = {
            statusCode: error.getStatus(),
            message: 'Validation error',
            errors: errorMessages.map((message: string) => ({
              message,
              errorCode: 'VALIDATION_ERROR',
            })),
            timestamp: new Date().toISOString(),
            path: context.switchToHttp().getRequest().url,
          };

          return throwError(() => new BadRequestException(formattedError));
        }
        return throwError(() => error);
      }),
    );
  }
}
