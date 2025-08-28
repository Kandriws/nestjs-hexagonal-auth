import { UserId } from 'src/shared/domain/types';
import { TokenType } from '../enums';
import { CreateTokenDto } from '../dtos/create-token.dto';
import { Entity } from 'src/shared/domain/entities';
import {
  UserSessionExpirationException,
  TokenAlreadyConsumedException,
} from '../exceptions';

interface TokenProperties {
  id: string;
  userId: UserId;
  type: TokenType;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata: Readonly<{
    ipAddress?: string;
    userAgent?: string;
  }>;
  consumedAt?: Date | null;
}

export class Token extends Entity<TokenProperties> {
  constructor(protected readonly props: TokenProperties) {
    super(props, props.id);
  }

  static create(props: CreateTokenDto): Token {
    if (props.expiresAt <= new Date()) {
      throw new UserSessionExpirationException();
    }

    return new Token({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
      consumedAt: null,
      metadata: props.metadata || {},
    });
  }

  static reconstitute(props: TokenProperties): Token {
    return new Token(props);
  }

  get userId(): UserId {
    return this.props.userId;
  }

  get type(): TokenType {
    return this.props.type;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get metadata(): Readonly<{
    ipAddress?: string;
    userAgent?: string;
  }> {
    return this.props.metadata;
  }

  get consumedAt(): Date | null | undefined {
    return this.props.consumedAt;
  }

  isConsumed(): boolean {
    return !!this.props.consumedAt;
  }

  consume(): void {
    if (this.isConsumed()) {
      throw new TokenAlreadyConsumedException();
    }
    this.props.consumedAt = new Date();
  }
}
