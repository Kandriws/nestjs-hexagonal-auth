import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Post,
  Patch,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CreateRolePort } from 'src/auth/domain/ports/inbound';
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
  ApiResponse as SwaggerResponse,
  ApiExtraModels,
  ApiBearerAuth,
  getSchemaPath,
} from '@nestjs/swagger';
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
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new role', operationId: 'createRole' })
  @SwaggerResponse({
    status: HttpStatus.CREATED,
    description: 'Role created successfully',
    schema: { $ref: getSchemaPath(SwaggerRoleResponseDto) },
  })
  @SwaggerResponse({
    status: 400,
    description: 'Bad Request',
    schema: { $ref: getSchemaPath(SwaggerErrorResponseDto) },
  })
  @SwaggerResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { $ref: getSchemaPath(SwaggerErrorResponseDto) },
  })
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
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Role updated successfully',
    schema: { $ref: getSchemaPath(SwaggerRoleResponseDto) },
  })
  @SwaggerResponse({
    status: 404,
    description: 'Role not found',
    schema: { $ref: getSchemaPath(SwaggerErrorResponseDto) },
  })
  @SwaggerResponse({
    status: 400,
    description: 'Bad Request',
    schema: { $ref: getSchemaPath(SwaggerErrorResponseDto) },
  })
  @SwaggerResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { $ref: getSchemaPath(SwaggerErrorResponseDto) },
  })
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
}
