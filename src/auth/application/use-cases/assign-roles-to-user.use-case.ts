import { Inject, Injectable } from '@nestjs/common';
import { AuthEventType } from 'src/auth/domain/enums';
import { AssignUserRolesCommand } from 'src/auth/domain/ports/inbound/commands/assign-user-roles.command';
import { AssignUserRolesPort } from 'src/auth/domain/ports/inbound/assign-user-roles.port';
import { EventPublisherPort } from 'src/auth/domain/ports/outbound/messaging';
import {
  TransactionManagerPort,
  UserRepositoryPort,
} from 'src/auth/domain/ports/outbound/persistence';
import { RoleRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/role.repository.port';
import { UUIDPort } from 'src/auth/domain/ports/outbound/security';
import {
  UserNotFoundException,
  RoleNotFoundException,
} from 'src/auth/domain/exceptions';
import { PublishableUserRoleAssignedEvent } from 'src/auth/domain/types';
import { UserId } from 'src/shared/domain/types';

@Injectable()
export class AssignRolesToUserUseCase implements AssignUserRolesPort {
  constructor(
    @Inject(UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
    @Inject(RoleRepositoryPort)
    private readonly roleRepository: RoleRepositoryPort,
    @Inject(UUIDPort)
    private readonly uuid: UUIDPort,
    @Inject(TransactionManagerPort)
    private readonly txManager: TransactionManagerPort,
    @Inject(EventPublisherPort)
    private readonly eventPublisher: EventPublisherPort,
  ) {}

  async execute(command: AssignUserRolesCommand): Promise<void> {
    const user = await this.userRepository.findById(command.userId as UserId);
    if (!user) throw new UserNotFoundException();

    for (const roleId of command.roleIds) {
      const role = await this.roleRepository.findById(roleId);
      if (!role) throw new RoleNotFoundException();
    }

    const event: PublishableUserRoleAssignedEvent = {
      eventId: this.uuid.generate(),
      eventType: AuthEventType.USER_ROLE_ASSIGNED,
      eventVersion: 'v1',
      occurredAt: new Date().toISOString(),
      producer: 'auth-service',
      aggregateId: command.userId,
      payload: {
        userId: command.userId,
        roleIds: command.roleIds,
        assignedById: command.assignedById ?? null,
      },
    };

    await this.txManager.runInTransaction(async () => {
      await this.userRepository.assignRoles(
        command.userId,
        command.roleIds,
        command.assignedById ?? null,
      );

      await this.eventPublisher.publish(event);
    });
  }
}
