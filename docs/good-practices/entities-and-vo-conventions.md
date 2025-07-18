# 📘 Pocket Guide  
**Value Objects & Entities**  
*TypeScript / NestJS Edition*

---

| | |
|---|---|
| **Author** | Kewin Caviedes 🧑‍💻 |
| **Version** | 1.0 ‑ July 18 2025 |
| **Audience** | Backend engineers, architects, code-review heroes |

---


1. Purpose  
This document defines the canonical way to implement **Value Objects (VO)** and **Aggregates / Entities** in our codebase.  
Following these rules guarantees:  
• True immutability  
• Compile-time type safety  
• Zero leakage of infrastructure concerns into the Domain layer  
• Easy refactoring when business rules evolve  

1. Definitions (quick recap)  
• **Value Object** – an immutable object whose identity is determined solely by the value of its attributes (e.g. Email, Money).  
• **Entity** – an object whose identity is stable through time and is defined by an Id rather than attributes (e.g. User, Invoice).  

1. Value Object Checklist  

| Rule | How to comply | Example |
|---|---|---|
| 3.1 Immutability | `readonly` fields, no setters | `private constructor(public readonly value: string)` |
| 3.2 Factory | Static factory named `of`, `from`, or `create` | `static of(value: string): Email` |
| 3.3 Validation | Throw **Domain Error** inside factory | `if (!regex) throw new InvalidEmailError(value)` |
| 3.4 Equality | Value-based `equals` + `hashCode` (or `===` for branded types) | `equals(other: Email) => this.value === other.value` |
| 3.5 No external deps | Only: primitives, other VOs, or injected **ports** | `matches(raw: string, hasherPort)` |
| 3.6 String representation | `toString()` & `toJSON()` | returns the primitive |
| 3.7 Nominal typing | Branded type (`__brand`) to prevent mix-ups | `type Email = string & { readonly __brand: unique symbol }` |

4. Entity Checklist  

| Rule | How to comply | Example |
|---|---|---|
| 4.1 Identity VO | Wrap id in a branded VO | `public readonly id: UserId` |
| 4.2 Immutability | Never mutate; always return **new instance** | `changeEmail(newEmail) => new User(...)` |
| 4.3 Invariants | Enforce inside factory / methods | `if (age < 18) throw new UnderageUserError()` |
| 4.4 Factory | Static factory on aggregate root | `User.create(...)` |
| 4.5 No setters | Expose only getters | `get email(): Email { return this._email }` |
| 4.6 Equality | Identity-based | `equals(other: User) => this.id === other.id` |
| 4.7 Serialization | Prefer **DTOs**; keep entities infrastructure-free | use mappers |

5. Directory Layout (canonical)

```
src
└── shared
    └── domain
        └── value-objects
            ├── user-id.vo.ts
            ├── email.vo.ts
            └── money.vo.ts
└── auth
    └── domain
        ├── model
        │   ├── user.entity.ts
        │   └── role.entity.ts
        ├── service          (domain services)
        ├── port             (domain-level ports, if needed)
        └── event
```

6. Naming Conventions  

| Artifact | Convention |
|---|---|
| VO filename | `email.vo.ts`, `money.vo.ts` |
| Entity filename | `user.entity.ts` |
| Factory method | `Email.of(value)` |
| Errors | `InvalidEmailError`, `UserNotFoundError` |

7. Sample VO (full)

```ts
// shared/domain/value-objects/email.vo.ts
type Email = string & { readonly __brand: unique symbol };

export class Email {
  private static readonly REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor() {} // never called directly

  static of(value: string): Email {
    const trimmed = value.trim().toLowerCase();
    if (!Email.REGEX.test(trimmed)) {
      throw new InvalidEmailError(trimmed);
    }
    return trimmed as Email;
  }

  static equals(left: Email, right: Email): boolean {
    return left === right;
  }

  toString(): string {
    return this as unknown as string;
  }
}

export class InvalidEmailError extends Error {
  constructor(value: string) {
    super(`"${value}" is not a valid email`);
  }
}
```

8. Sample Entity (full)

```ts
// auth/domain/model/user.entity.ts
import { UserId } from '@shared/domain/value-objects/user-id.vo';
import { Email } from '@shared/domain/value-objects/email.vo';
import { Password } from './password.vo';

export class User {
  private constructor(
    public readonly id: UserId,
    private readonly _email: Email,
    private readonly _password: Password,
    private readonly _isEmailVerified: boolean,
  ) {}

  static create(
    id: UserId,
    email: Email,
    password: Password,
  ): User {
    return new User(id, email, password, false);
  }

  changeEmail(email: Email): User {
    return new User(this.id, email, this._password, false);
  }

  markEmailVerified(): User {
    return new User(this.id, this._email, this._password, true);
  }

  get email(): Email {
    return this._email;
  }

  equals(other: User): boolean {
    return other instanceof User && other.id === this.id;
  }
}
```

9. Testing Cheat-Sheet  

• VOs: assert equality, immutability, validation, JSON round-trip.  
• Entities: assert identity equality, immutability, invariant enforcement.  
• Use **fast-check** or **jest** property-based tests for VOs to cover edge cases.

10. Common Pitfalls  

| Pitfall | Fix |
|---|---|
| Using `class-validator` decorators inside VO | Move validation to factory; keep VO framework-free. |
| Exposing setters on entities | Always return new instance. |
| Mixing VO logic with infrastructure (e.g. bcrypt) | Inject a port or move to domain service. |
| Using primitive `string`/`number` for ids | Wrap in branded VO. |

11. Versioning & Migration  

• When the id strategy changes (e.g. UUID → ULID) only the VO or Id-generator service changes.  
• Serialize the primitive (string/number) to the database and reconstruct via factory on read.  

12. TL;DR  

Value Objects: small, immutable, self-validating, no external refs.  
Entities: identity-based, immutable snapshots, enforce invariants via factories/methods.  

Follow the checklist and the codebase stays **clean, testable, and refactor-proof** for years.