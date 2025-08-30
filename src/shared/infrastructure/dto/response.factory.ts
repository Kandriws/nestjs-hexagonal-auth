import { ApiResponse } from './api-response.dto';

interface Payload<T> {
  data?: T;
  message: string;
}
export class ResponseFactory {
  static ok<T>(payload: Payload<T>): ApiResponse<T> {
    const { data, message } = payload;
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  static created<T>(payload: Payload<T>): ApiResponse<T> {
    const { data, message } = payload;
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  static error<T = null>(message: string, data?: T): ApiResponse<T | null> {
    const payload: any = {
      success: false,
      message,
      data: data ?? undefined,
      timestamp: new Date().toISOString(),
    };

    return payload as ApiResponse<T | null>;
  }
}
