import { DomainEvent } from 'src/shared/domain/types/domain-event.type';

// ─── Payload types ─────────────────────────────────────────────

export interface UserRegisteredPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface UserVerifiedPayload {
  userId: string;
  email: string;
  verifiedAt: string;
}

export interface PasswordResetRequestedPayload {
  userId: string;
  email: string;
  resetToken: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserRoleAssignedPayload {
  userId: string;
  roleIds: string[];
  assignedById: string | null;
}

// ─── Typed event aliases ───────────────────────────────────────

export type UserRegisteredEvent = DomainEvent<UserRegisteredPayload>;
export type UserVerifiedEvent = DomainEvent<UserVerifiedPayload>;
export type PasswordResetRequestedEvent =
  DomainEvent<PasswordResetRequestedPayload>;
export type UserRoleAssignedEvent = DomainEvent<UserRoleAssignedPayload>;

// ─── Publishable event aliases (application → port) ──────────

export type PublishableUserRegisteredEvent = Omit<
  UserRegisteredEvent,
  'traceId'
>;
export type PublishableUserVerifiedEvent = Omit<UserVerifiedEvent, 'traceId'>;
export type PublishablePasswordResetRequestedEvent = Omit<
  PasswordResetRequestedEvent,
  'traceId'
>;
export type PublishableUserRoleAssignedEvent = Omit<
  UserRoleAssignedEvent,
  'traceId'
>;
