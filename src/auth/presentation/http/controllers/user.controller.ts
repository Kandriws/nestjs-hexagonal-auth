import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Patch,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
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
  ) {}

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
    const command = AssignUserRolesMapper.toCommand(id, assignDto);
    command.assignedById = currentUser.getUserId();
    await this.assignUserRolesPort.execute(command);
    return ResponseFactory.ok<void>({
      message: 'Roles assigned to user successfully',
    });
  }
}
