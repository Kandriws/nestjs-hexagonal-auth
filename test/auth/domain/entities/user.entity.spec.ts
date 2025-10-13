import { User } from 'src/auth/domain/entities';
import { UserId } from 'src/shared/domain/types';

function makeUserProps() {
  return {
    id: 'test-id' as UserId,
    email: 'test@example.com',
    password: 'initialPass123!',
    firstName: 'John',
    lastName: 'Doe',
  };
}

describe('User entity updates', () => {
  it('updates the password and updatedAt', () => {
    const props = makeUserProps();
    const user = User.create(props as any);

    const before = user.updatedAt;
    user.updatePassword('NewSecret1!');

    expect(user.password.getValue()).not.toBe(props.password);
    expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('updates the first name and updatedAt', () => {
    const props = makeUserProps();
    const user = User.create(props as any);

    const before = user.updatedAt;
    user.updateFirstName('Jane');

    expect(user.firstName.getValue()).toBe('Jane');
    expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('updates the last name and updatedAt', () => {
    const props = makeUserProps();
    const user = User.create(props as any);

    const before = user.updatedAt;
    user.updateLastName('Smith');

    expect(user.lastName.getValue()).toBe('Smith');
    expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });
});
