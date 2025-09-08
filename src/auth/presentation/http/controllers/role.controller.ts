import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Post,
  Patch,
  Param,
  ParseUUIDPipe,
  Delete,
  Get,
} from '@nestjs/common';
import {
  CreateRolePort,
  DeleteRolePort,
  FindRolesPort,
  FindRoleByIdPort,
  UpdateRolePort,
} from 'src/auth/domain/ports/inbound';
import {
  ApiResponse,
  ResponseFactory,
  SwaggerErrorResponseDto,
  SwaggerRoleResponseDto,
  SwaggerRolesResponseDto,
  SwaggerMessageResponseDto,
} from 'src/shared/infrastructure/dto';
import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import {
  ApiTags,
  ApiOperation,
  ApiExtraModels,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  ApiBadRequest,
  ApiUnauthorized,
  ApiNotFound,
  ApiNoContent,
  ApiOkDto,
  ApiCreatedDto,
  ApiUuidParam,
} from 'src/shared/infrastructure/decorators';
import { CreateRoleDto, RoleResponseDto, UpdateRoleDto } from '../dtos';
import {
  CreateRoleMapper,
  UpdateRoleMapper,
  AssignRolePermissionsMapper,
} from '../mappers';
import { AssignRolePermissionsDto } from '../dtos';
import { AssignRolePermissionsPort } from 'src/auth/domain/ports/inbound';

@ApiTags('Roles')
@ApiExtraModels(
  SwaggerRoleResponseDto,
  SwaggerRolesResponseDto,
  SwaggerErrorResponseDto,
)
@ApiBearerAuth()
@Controller('roles')
export class RoleController {
  constructor(
    @Inject(CreateRolePort)
    private readonly createRolePort: CreateRolePort,
    @Inject(UpdateRolePort)
    private readonly updateRolePort: UpdateRolePort,
    @Inject(DeleteRolePort)
    private readonly deleteRolePort: DeleteRolePort,
    @Inject(FindRolesPort)
    private readonly findRolesPort: FindRolesPort,
    @Inject(FindRoleByIdPort)
    private readonly findRoleByIdPort: FindRoleByIdPort,
    @Inject(AssignRolePermissionsPort)
    private readonly assignRolePermissionsPort: AssignRolePermissionsPort,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new role', operationId: 'createRole' })
  @ApiCreatedDto(SwaggerRoleResponseDto)
  @ApiBadRequest()
  @ApiUnauthorized()
  async create(
    @Body() createRoleDto: CreateRoleDto,
  ): Promise<ApiResponse<RoleResponseDto>> {
    const commandRole = CreateRoleMapper.toCommand(createRoleDto);
    const role = await this.createRolePort.execute(commandRole);
    return ResponseFactory.created<RoleResponseDto>({
      data: CreateRoleMapper.toResponse(role),
      message: 'Role has been created successfully',
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a role', operationId: 'updateRole' })
  @ApiUuidParam('id', 'Role id')
  @ApiOkDto(SwaggerMessageResponseDto)
  @ApiNotFound()
  @ApiBadRequest()
  @ApiUnauthorized()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<ApiResponse<RoleResponseDto>> {
    const command = UpdateRoleMapper.toCommand(id, updateRoleDto);
    const role = await this.updateRolePort.execute(command);
    return ResponseFactory.ok<RoleResponseDto>({
      data: CreateRoleMapper.toResponse(role),
      message: 'Role has been updated successfully',
    });
  }

  @Delete(':id')
  @ApiUuidParam('id', 'Role id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a role', operationId: 'deleteRole' })
  @ApiNoContent()
  @ApiNotFound()
  @ApiUnauthorized()
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<void>> {
    await this.deleteRolePort.execute(id);
    return ResponseFactory.noContent();
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all roles', operationId: 'findAllRoles' })
  @ApiOkDto(SwaggerRolesResponseDto)
  @ApiUnauthorized()
  async findAll(): Promise<ApiResponse<RoleResponseDto[]>> {
    const roles = await this.findRolesPort.execute();
    return ResponseFactory.ok<RoleResponseDto[]>({
      data: roles.map(CreateRoleMapper.toResponse),
      message: 'Roles retrieved successfully',
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a role by id', operationId: 'findRoleById' })
  @ApiUuidParam('id', 'Role id')
  @ApiOkDto(SwaggerMessageResponseDto)
  @ApiNotFound()
  @ApiUnauthorized()
  async findRoleById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<RoleResponseDto>> {
    const role = await this.findRoleByIdPort.execute(id);
    return ResponseFactory.ok<RoleResponseDto>({
      data: CreateRoleMapper.toResponse(role),
      message: 'Role retrieved successfully',
    });
  }

  @Patch(':id/permissions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Assign permissions to a role',
    operationId: 'assignPermissionsToRole',
  })
  @ApiUuidParam('id', 'Role id')
  @ApiOkDto(SwaggerRoleResponseDto)
  @ApiNotFound()
  @ApiBadRequest()
  @ApiUnauthorized()
  async assignPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignDto: AssignRolePermissionsDto,
  ): Promise<ApiResponse<void>> {
    const command = AssignRolePermissionsMapper.toCommand(id, assignDto);
    await this.assignRolePermissionsPort.execute(command);
    return ResponseFactory.ok<void>({
      message: 'Permissions assigned to role successfully',
    });
  }
}
