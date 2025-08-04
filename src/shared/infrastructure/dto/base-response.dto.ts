export interface BaseResponse<T = unknown> {
  success: true;
  data: T;
}
