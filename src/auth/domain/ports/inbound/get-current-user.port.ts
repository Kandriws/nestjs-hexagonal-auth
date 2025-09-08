import { UserId } from 'src/shared/domain/types';
import { GetCurrentUserResponse } from './commands/get-current-user-response';

export const GetCurrentUserPort = Symbol('GetCurrentUserPort');
export interface GetCurrentUserPort {
  execute(userId: UserId): Promise<GetCurrentUserResponse>;
}
