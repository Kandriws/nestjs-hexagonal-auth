/**
 * Helper utilities for testing in hexagonal architecture
 */

import { User } from 'src/auth/domain/entities';
import { UserId } from 'src/shared/domain/types';

/**
 * Creates a mock user entity for testing purposes
 */
export const createMockUser = (
  overrides?: Partial<{
    id: UserId;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }>,
): User => {
  const defaultUser = {
    id: '123e4567-e89b-12d3-a456-426614174000' as UserId,
    email: 'test@example.com',
    password: 'hashedPassword123',
    firstName: 'John',
    lastName: 'Doe',
  };

  return User.create({ ...defaultUser, ...overrides });
};

/**
 * Creates a mock command for testing purposes
 */
export const createMockRegisterUserCommand = (
  overrides?: Partial<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }>,
) => {
  const defaultCommand = {
    email: 'test@example.com',
    password: 'SecurePass123!',
    firstName: 'John',
    lastName: 'Doe',
  };

  return { ...defaultCommand, ...overrides };
};

/**
 * Helper to create jest mocks for repository ports
 */
export const createMockRepository = <T extends object>(): jest.Mocked<T> => {
  const mock = {} as jest.Mocked<T>;

  // Common repository methods
  const commonMethods = ['findById', 'findByEmail', 'save', 'update', 'delete'];

  commonMethods.forEach((method) => {
    if (method in mock) {
      (mock as any)[method] = jest.fn();
    }
  });

  return mock;
};

/**
 * Create a typed jest mock for any interface T.
 * Usage: const repo = createMock<MyRepoPort>();
 */
export const createMock = <T extends object>(): jest.Mocked<T> => {
  const target: Record<PropertyKey, any> = {};
  return new Proxy(target, {
    get: (_t, prop: PropertyKey) => {
      if (!(prop in target)) {
        target[prop] = jest.fn();
      }
      return target[prop];
    },
  }) as unknown as jest.Mocked<T>;
};
