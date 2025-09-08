import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Patch,
  Param,
  ParseUUIDPipe,
  Get,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { FindUsersPort } from 'src/auth/domain/ports/inbound/find-users.port';
import { SwaggerUsersResponseDto } from 'src/shared/infrastructure/dto/swagger-user-response.dto';
import { CreateUserMapper } from '../mappers/create-user.mapper';
import {
  SwaggerErrorResponseDto,
  SwaggerRoleResponseDto,
  SwaggerRolesResponseDto,
  ApiResponse,
  ResponseFactory,
} from 'src/shared/infrastructure/dto';
import {
  ApiOkDto,
  ApiUuidParam,
  ApiBadRequest,
  ApiUnauthorized,
  ApiNotFound,
} from 'src/shared/infrastructure/decorators';
import { AssignUserRolesDto } from '../dtos/assign-user-roles.dto';
import { AssignUserRolesMapper } from '../mappers/assign-user-roles.mapper';
import { AssignUserRolesPort } from 'src/auth/domain/ports/inbound/assign-user-roles.port';
import { AssignUserPermissionsDto } from '../dtos/assign-user-permissions.dto';
import { AssignUserPermissionsMapper } from '../mappers/assign-user-permissions.mapper';
import { AssignUserPermissionsPort } from 'src/auth/domain/ports/inbound/assign-user-permissions.port';
import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { CurrentUser } from 'src/auth/infrastructure/decorators/current-user.decorator';
import { TokenPayloadVo } from 'src/auth/domain/value-objects';

@ApiTags('Users')
@ApiExtraModels(
  SwaggerRoleResponseDto,
  SwaggerRolesResponseDto,
  SwaggerErrorResponseDto,
)
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    @Inject(AssignUserRolesPort)
    private readonly assignUserRolesPort: AssignUserRolesPort,
    @Inject(AssignUserPermissionsPort)
    private readonly assignUserPermissionsPort: AssignUserPermissionsPort,
    @Inject(FindUsersPort)
    private readonly findUsersPort: FindUsersPort,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users', operationId: 'findAllUsers' })
  @ApiOkDto(SwaggerUsersResponseDto)
  @ApiUnauthorized()
  async findAll(): Promise<ApiResponse<any[]>> {
    const users = await this.findUsersPort.execute();
    return ResponseFactory.ok<any[]>({
      data: users.map(CreateUserMapper.toResponse),
      message: 'Users retrieved successfully',
    });
  }

  @Patch(':id/roles')
  @HttpCode(HttpStatus.OK)
  @ApiUuidParam('id', 'User id')
  @ApiOkDto(SwaggerRoleResponseDto)
  @ApiOperation({
    summary: 'Assign roles to a user',
    operationId: 'assignRolesToUser',
  })
  @ApiBadRequest()
  @ApiUnauthorized()
  @ApiNotFound()
  async assignRoles(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignDto: AssignUserRolesDto,
    @CurrentUser() currentUser: TokenPayloadVo,
  ): Promise<ApiResponse<void>> {
    const command = AssignUserRolesMapper.toCommand(
      id,
      assignDto,
      currentUser.getUserId(),
    );
    await this.assignUserRolesPort.execute(command);
    return ResponseFactory.ok<void>({
      message: 'Roles assigned to user successfully',
    });
  }

  @Patch(':id/permissions')
  @HttpCode(HttpStatus.OK)
  @ApiUuidParam('id', 'User id')
  @ApiOkDto(SwaggerRoleResponseDto)
  @ApiOperation({
    summary: 'Assign permissions to a user',
    operationId: 'assignPermissionsToUser',
  })
  @ApiBadRequest()
  @ApiUnauthorized()
  @ApiNotFound()
  async assignPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignDto: AssignUserPermissionsDto,
    @CurrentUser() currentUser: TokenPayloadVo,
  ): Promise<ApiResponse<void>> {
    const command = AssignUserPermissionsMapper.toCommand(
      id,
      assignDto,
      currentUser.getUserId(),
    );

    await this.assignUserPermissionsPort.execute(command);
    return ResponseFactory.ok<void>({
      message: 'Permissions assigned to user successfully',
    });
  }
}
