import { ApiResponse } from './api-response.dto';

interface Payload<T> {
  message: string;
  data?: T;
}
export class ResponseFactory {
  static ok<T>(payload: Payload<T>): ApiResponse<T> {
    const { data, message } = payload;
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static created<T>(payload: Payload<T>): ApiResponse<T> {
    const { data, message } = payload;
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static noContent(): ApiResponse<null> {
    return {
      success: true,
      message: 'No Content',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  static error<T = null>(
    message: string,
    data?: T,
    code?: string,
  ): ApiResponse<T | null> {
    const payload: any = {
      success: false,
      message,
      data: data ?? undefined,
      timestamp: new Date().toISOString(),
    };
    if (code) {
      payload.code = code;
    } else if (data && typeof data === 'object' && (data as any).code) {
      // Backwards-compat: extract code from data object if caller embedded it.
      payload.code = (data as any).code;
      if (Object.keys(data as any).length === 1) delete payload.data;
    }

    return payload as ApiResponse<T | null>;
  }
}
