export abstract class Entity<T> {
  /**
   * Represents a base entity with generic properties.
   * @param props - The properties of the entity.
   */
  protected readonly props: T;
  public readonly id: string;

  constructor(props: T, id: string) {
    this.props = props;
    this.id = id;
  }

  getProps(): T {
    return this.props;
  }

  public equals(other: Entity<T>): boolean {
    if (this === other) return true;
    return this.id === other.id;
  }
}
