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

  static error(message: string): ApiResponse<null> {
    return { success: false, message, timestamp: new Date().toISOString() };
  }
}
