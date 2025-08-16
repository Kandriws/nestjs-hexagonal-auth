# Login Rate Limiting - Escalated Locking System

## Summary

The login rate limiting system implements an escalated policy that progressively increases the lock time based on the number of failed login attempts.

## Policy Configuration

### "Standard" Policy
```typescript
{
  attempts: 5, lockMinutes: 5,    // First level: 5 attempts -> 5 minutes
  attempts: 10, lockMinutes: 15,  // Second level: 10 attempts -> 15 minutes  
  attempts: 15, lockMinutes: 30,  // Third level: 15 attempts -> 30 minutes
}
```

### "Aggressive" Policy
```typescript
{
  attempts: 3, lockMinutes: 15,     // First level: 3 attempts -> 15 minutes
  attempts: 6, lockMinutes: 30,     // Second level: 6 attempts -> 30 minutes
  attempts: 10, lockMinutes: 60,    // Third level: 10 attempts -> 60 minutes
  attempts: 15, lockMinutes: 1440,  // Fourth level: 15 attempts -> 24 hours
}
```

## Escalation Flow

### Scenario with Standard Policy:

1. **Attempts 1-4**: The user may continue trying
   - Each failed attempt increments the counter
   - No lock is applied yet

2. **Attempt 5**: First threshold reached
   - The user is locked for 5 minutes
   - The counter remains at 5

3. **After 5 minutes**: The lock expires
   - If the user tries to log in again and fails:
   - The counter escalates to the next level (10 attempts)
   - The user is locked for 15 minutes

4. **After 15 minutes**: The lock expires
   - If the user tries to log in again and fails:
   - The counter escalates to the next level (15 attempts)
   - The user is locked for 30 minutes

5. **Maximum level reached**:
   - After the last threshold, each further failed attempt keeps the maximum lock time
   - The counter continues to increment but the lock duration stays at 30 minutes

### System Reset

The counter is fully reset when:
- The user successfully logs in
- The `reset(userId)` method is explicitly called

## Implementation

### Main Components

1. **PrismaLoginRateLimitAdapter**: Handles persistence and escalation logic
2. **RateLimitWindow**: Entity that encapsulates time window logic
3. **LOCK_POLICIES**: Constants that define thresholds per policy

### Key Methods

- `hit(userId)`: Registers a failed attempt and applies escalation logic
- `reset(userId)`: Completely resets the user's counter

### Database

Table `LoginRateLimit`:
```sql
CREATE TABLE "LoginRateLimit" (
  "userId"      TEXT PRIMARY KEY,
  "attempts"    INTEGER DEFAULT 0,
  "windowStart" TIMESTAMP,
  "windowEnd"   TIMESTAMP,
  "createdAt"   TIMESTAMP DEFAULT NOW(),
  "updatedAt"   TIMESTAMP
);
```

## Usage Examples

### Failed Login
```typescript
try {
  // Validate credentials...
  if (!validCredentials) {
    await rateLimitAdapter.hit(userId);
    throw new InvalidCredentialsException();
  }
} catch (LoginRateLimitExceededException) {
  // User is locked - show a message with remaining time
}
```

### Successful Login
```typescript
if (validCredentials) {
  // Reset rate limiting on successful login
  await rateLimitAdapter.reset(userId);
  // Continue with login flow...
}
```

## Advantages of the Escalated System

1. **Progressive Protection**: Lock time increases with each escalation
2. **Flexibility**: Different policies for different security requirements
3. **Intelligent Reset**: Only resets on successful login or explicit reset, not by time alone
4. **Persistence**: State is preserved across application restarts
5. **Automatic Escalation**: Does not require manual intervention to escalate
