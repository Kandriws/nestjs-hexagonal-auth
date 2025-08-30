import { applyDecorators } from '@nestjs/common';
import {
  ApiParam,
  getSchemaPath,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import { SwaggerErrorResponseDto } from 'src/shared/infrastructure/dto/swagger-error-response.dto';

/** Common Swagger response decorators to reduce repetition in controllers */
export function ApiBadRequest() {
  return applyDecorators(
    SwaggerResponse({
      status: 400,
      description: 'Bad Request',
      schema: { $ref: getSchemaPath(SwaggerErrorResponseDto) },
    }),
  );
}

export function ApiUnauthorized() {
  return applyDecorators(
    SwaggerResponse({
      status: 401,
      description: 'Unauthorized',
      schema: { $ref: getSchemaPath(SwaggerErrorResponseDto) },
    }),
  );
}

export function ApiNotFound() {
  return applyDecorators(
    SwaggerResponse({
      status: 404,
      description: 'Not found',
      schema: { $ref: getSchemaPath(SwaggerErrorResponseDto) },
    }),
  );
}

export function ApiNoContent() {
  return applyDecorators(
    SwaggerResponse({ status: 204, description: 'No Content' }),
  );
}

export function ApiOkDto(dto: any) {
  return applyDecorators(
    SwaggerResponse({
      status: 200,
      description: 'OK',
      schema: { $ref: getSchemaPath(dto) },
    }),
  );
}

export function ApiCreatedDto(dto: any) {
  return applyDecorators(
    SwaggerResponse({
      status: 201,
      description: 'Created',
      schema: { $ref: getSchemaPath(dto) },
    }),
  );
}

export function ApiUuidParam(name = 'id', description = 'UUID parameter') {
  return applyDecorators(
    ApiParam({
      name,
      description,
      required: true,
      schema: {
        type: 'string',
        format: 'uuid',
        example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      },
    }),
  );
}
