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
} from '@nestjs/common';
import { CreateRolePort, DeleteRolePort } from 'src/auth/domain/ports/inbound';
import {
  ApiResponse,
  ResponseFactory,
  SwaggerErrorResponseDto,
  SwaggerRoleResponseDto,
} from 'src/shared/infrastructure/dto';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { CreateRoleMapper } from '../mappers/create-role.mapper';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { UpdateRoleMapper } from '../mappers/update-role.mapper';
import { UpdateRolePort } from 'src/auth/domain/ports/inbound';
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
import { RoleResponseDto } from '../dtos/role-response.dto';

@ApiTags('Roles')
@ApiExtraModels(SwaggerRoleResponseDto, SwaggerErrorResponseDto)
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
  @ApiOkDto(SwaggerRoleResponseDto)
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
}
