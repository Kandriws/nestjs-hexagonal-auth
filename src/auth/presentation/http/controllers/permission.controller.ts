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
  CreatePermissionPort,
  DeletePermissionPort,
  FindPermissionsPort,
  FindPermissionByIdPort,
  UpdatePermissionPort,
} from 'src/auth/domain/ports/inbound';
import {
  ApiResponse,
  ResponseFactory,
  SwaggerErrorResponseDto,
  SwaggerPermissionResponseDto,
  SwaggerPermissionsResponseDto,
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
import {
  CreatePermissionDto,
  PermissionResponseDto,
  UpdatePermissionDto,
} from '../dtos';
import { CreatePermissionMapper, UpdatePermissionMapper } from '../mappers';

@ApiTags('Permissions')
@ApiExtraModels(
  SwaggerPermissionResponseDto,
  SwaggerPermissionsResponseDto,
  SwaggerErrorResponseDto,
)
@ApiBearerAuth()
@Controller('permissions')
export class PermissionController {
  constructor(
    @Inject(CreatePermissionPort)
    private readonly createPermissionPort: CreatePermissionPort,
    @Inject(UpdatePermissionPort)
    private readonly updatePermissionPort: UpdatePermissionPort,
    @Inject(DeletePermissionPort)
    private readonly deletePermissionPort: DeletePermissionPort,
    @Inject(FindPermissionsPort)
    private readonly findPermissionsPort: FindPermissionsPort,
    @Inject(FindPermissionByIdPort)
    private readonly findPermissionByIdPort: FindPermissionByIdPort,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new permission',
    operationId: 'createPermission',
  })
  @ApiCreatedDto(SwaggerPermissionResponseDto)
  @ApiBadRequest()
  @ApiUnauthorized()
  async create(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<ApiResponse<PermissionResponseDto>> {
    const command = CreatePermissionMapper.toCommand(createPermissionDto);
    const permission = await this.createPermissionPort.execute(command);
    return ResponseFactory.created<PermissionResponseDto>({
      data: CreatePermissionMapper.toResponse(permission),
      message: 'Permission has been created successfully',
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a permission',
    operationId: 'updatePermission',
  })
  @ApiUuidParam('id', 'Permission id')
  @ApiOkDto(SwaggerPermissionResponseDto)
  @ApiNotFound()
  @ApiBadRequest()
  @ApiUnauthorized()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<ApiResponse<PermissionResponseDto>> {
    const command = UpdatePermissionMapper.toCommand(id, updatePermissionDto);
    const permission = await this.updatePermissionPort.execute(command);
    return ResponseFactory.ok<PermissionResponseDto>({
      data: CreatePermissionMapper.toResponse(permission),
      message: 'Permission has been updated successfully',
    });
  }

  @Delete(':id')
  @ApiUuidParam('id', 'Permission id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a permission',
    operationId: 'deletePermission',
  })
  @ApiNoContent()
  @ApiNotFound()
  @ApiUnauthorized()
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<void>> {
    await this.deletePermissionPort.execute(id);
    return ResponseFactory.noContent();
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all permissions',
    operationId: 'findAllPermissions',
  })
  @ApiOkDto(SwaggerPermissionsResponseDto)
  @ApiUnauthorized()
  async findAll(): Promise<ApiResponse<PermissionResponseDto[]>> {
    const permissions = await this.findPermissionsPort.execute();
    return ResponseFactory.ok<PermissionResponseDto[]>({
      data: permissions.map(CreatePermissionMapper.toResponse),
      message: 'Permissions retrieved successfully',
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a permission by id',
    operationId: 'findPermissionById',
  })
  @ApiUuidParam('id', 'Permission id')
  @ApiOkDto(SwaggerPermissionResponseDto)
  @ApiNotFound()
  @ApiUnauthorized()
  async findPermissionById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<PermissionResponseDto>> {
    const permission = await this.findPermissionByIdPort.execute(id);
    return ResponseFactory.ok<PermissionResponseDto>({
      data: CreatePermissionMapper.toResponse(permission),
      message: 'Permission retrieved successfully',
    });
  }
}
