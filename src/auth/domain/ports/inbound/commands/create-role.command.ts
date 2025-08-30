import { NameVo } from 'src/shared/domain/value-objects';

export interface CreateRoleCommand {
  name: NameVo;
  description?: string | null;
  realm: NameVo;
}
