import { NameVo } from 'src/shared/domain/value-objects';

export interface PermissionCommand {
  name: NameVo;
  realm: NameVo;
}
