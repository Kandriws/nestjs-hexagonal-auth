import { NameVo } from 'src/shared/domain/value-objects';

export interface RoleCommand {
  name: NameVo;
  description?: string | null;
  realm: NameVo;
}
