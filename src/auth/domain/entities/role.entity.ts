import { Entity } from 'src/shared/domain/entities';
import { NameVo } from 'src/shared/domain/value-objects';

export interface RoleProperties {
  id: string;
  name: NameVo;
  description?: string | null;
  realm: NameVo;
}

export class Role extends Entity<RoleProperties> {
  constructor(protected readonly props: RoleProperties) {
    super(props, props.id);
  }

  static create(createProps: RoleProperties): Role {
    return new Role(createProps);
  }

  static reconstitute(props: RoleProperties): Role {
    return new Role(props);
  }

  get name(): string {
    return this.props.name.getValue();
  }

  get description(): string | null | undefined {
    return this.props.description;
  }

  get realm(): string {
    return this.props.realm.getValue();
  }
}
