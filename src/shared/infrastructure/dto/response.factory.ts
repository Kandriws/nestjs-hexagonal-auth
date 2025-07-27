import { BaseResponse } from './base-response.dto';

export class ResponseFactory {
  static ok<T>(data: T): BaseResponse<T> {
    return { success: true, data };
  }

  static created<T>(data: T): BaseResponse<T> {
    return { success: true, data };
  }
}
