import { Entity } from 'src/shared/domain/entities';
import { NameVo } from 'src/shared/domain/value-objects';

export interface PermissionProperties {
  id: string;
  name: NameVo;
  realm: NameVo;
}

export class Permission extends Entity<PermissionProperties> {
  constructor(protected readonly props: PermissionProperties) {
    super(props, props.id);
  }

  static create(createProps: PermissionProperties): Permission {
    return new Permission(createProps);
  }

  static reconstitute(props: PermissionProperties): Permission {
    return new Permission(props);
  }

  update(props: Partial<Omit<PermissionProperties, 'id'>>): void {
    Object.assign(this.props, props);
  }

  get name(): string {
    return this.props.name.getValue();
  }

  get realm(): string {
    return this.props.realm.getValue();
  }
}
