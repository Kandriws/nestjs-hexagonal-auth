/**
 * All domain event type identifiers for the Auth bounded context.
 */
export enum AuthEventType {
  USER_REGISTERED = 'auth.user.registered.v1',
  USER_VERIFIED = 'auth.user.verified.v1',
  PASSWORD_RESET_REQUESTED = 'auth.password.reset.requested.v1',
  USER_ROLE_ASSIGNED = 'auth.user.role.assigned.v1',
}
