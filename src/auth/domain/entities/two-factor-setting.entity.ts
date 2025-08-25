import { UserId } from 'src/shared/domain/types';
import { TwoFactorMethod } from '../enums';
import {
  EnableTwoFactorDecision,
  EnableTwoFactorDecisionType,
} from '../enums/enable-two-factor-decision.enum';
import { Entity } from 'src/shared/domain/entities';
import { SecretMetadata } from '../types/encryption.type';
import {
  InvalidMethodTwoFactorSettingException,
  TwoFactorSettingAlreadyVerifiedException,
} from '../exceptions';

export interface TwoFactorSettingProps {
  id: string;
  userId: UserId;
  isEnabled: boolean;
  method: TwoFactorMethod;
  secretCiphertext: string | null;
  secretMetadata: SecretMetadata | null;
  verifiedAt: Date | null;
  lastUsedAt: Date | null;
  pendingMethod: TwoFactorMethod | null;
  pendingSecretCiphertext: string | null;
  pendingSecretMetadata: SecretMetadata | null;
  createdAt: Date;
  updatedAt: Date;
}

export class TwoFactorSetting extends Entity<TwoFactorSettingProps> {
  private constructor(readonly props: TwoFactorSettingProps) {
    super(props, props.id);
  }

  static create(
    id: string,
    userId: UserId,
    method: TwoFactorMethod,
    secretCiphertext: string | null = null,
    secretMetadata: SecretMetadata | null = null,
  ): TwoFactorSetting {
    const props: TwoFactorSettingProps = {
      id,
      userId,
      isEnabled: false,
      method,
      secretCiphertext,
      secretMetadata,
      verifiedAt: null,
      lastUsedAt: null,
      pendingMethod: null,
      pendingSecretCiphertext: null,
      pendingSecretMetadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return new TwoFactorSetting(props);
  }

  static reconstitute(props: TwoFactorSettingProps): TwoFactorSetting {
    return new TwoFactorSetting(props);
  }

  get userId(): UserId {
    return this.props.userId;
  }

  get isEnabled(): boolean {
    return this.props.isEnabled;
  }

  get method(): TwoFactorMethod {
    return this.props.method;
  }

  get secretCiphertext(): string | null {
    return this.props.secretCiphertext;
  }

  get secretMetadata(): SecretMetadata | null {
    return this.props.secretMetadata;
  }

  get verifiedAt(): Date | null {
    return this.props.verifiedAt;
  }

  get lastUsedAt(): Date | null {
    return this.props.lastUsedAt;
  }

  get pendingMethod(): TwoFactorMethod | null {
    return this.props.pendingMethod;
  }

  get pendingSecretCiphertext(): string | null {
    return this.props.pendingSecretCiphertext;
  }

  get pendingSecretMetadata(): SecretMetadata | null {
    return this.props.pendingSecretMetadata;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  verify(method: TwoFactorMethod): void {
    if (this.props.verifiedAt)
      throw new TwoFactorSettingAlreadyVerifiedException();

    if (!this.isMatchingMethod(method))
      throw new InvalidMethodTwoFactorSettingException();

    this.props.isEnabled = true;
    this.props.verifiedAt = new Date();
    this.props.updatedAt = new Date();
  }

  initializePendingTwoFactorState(
    method: TwoFactorMethod,
    secretCiphertext: string,
    secretMetadata: SecretMetadata,
  ): void {
    this.props.pendingMethod = method;
    this.props.pendingSecretCiphertext = secretCiphertext;
    this.props.pendingSecretMetadata = secretMetadata;
    this.props.updatedAt = new Date();
  }

  isMatchingMethod(method: TwoFactorMethod): boolean {
    return this.props.method === method;
  }

  isMethodNotifyable(): boolean {
    const notifyableMethods = [
      TwoFactorMethod.EMAIL_OTP,
      TwoFactorMethod.SMS_OTP,
    ];

    return notifyableMethods.includes(this.props.method);
  }

  /**
   * Decide what action should be taken when a user requests to enable two-factor
   * for the provided method. This keeps business rules inside the domain model
   * and lets the use-case orchestrate side-effects based on the decision.
   */
  decideEnableRequest(method: TwoFactorMethod): EnableTwoFactorDecision {
    if (this.props.isEnabled && this.isMatchingMethod(method)) {
      if (!this.props.verifiedAt) {
        if (
          method === TwoFactorMethod.EMAIL_OTP ||
          method === TwoFactorMethod.SMS_OTP
        ) {
          return {
            type: EnableTwoFactorDecisionType.SEND_OTP,
          };
        }
      }

      return { type: EnableTwoFactorDecisionType.ALREADY_ENABLED };
    }

    if (this.props.isEnabled && !this.isMatchingMethod(method)) {
      if (this.isMethodNotifyable()) {
        return {
          type: EnableTwoFactorDecisionType.SEND_OTP,
        };
      }

      return { type: EnableTwoFactorDecisionType.GENERATE_TOTP };
    }

    return { type: EnableTwoFactorDecisionType.GENERATE_OTP };
  }

  updateToTotp(secretCiphertext: string, secretMetadata: SecretMetadata): void {
    this.props.method = TwoFactorMethod.TOTP;
    this.props.secretCiphertext = secretCiphertext;
    this.props.secretMetadata = secretMetadata;
    this.props.updatedAt = new Date();
  }
}
