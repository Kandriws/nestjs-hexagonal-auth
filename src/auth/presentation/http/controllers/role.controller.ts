import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { CreateRolePort } from 'src/auth/domain/ports/inbound';
import {
  ApiResponse,
  ResponseFactory,
  SwaggerErrorResponseDto,
  SwaggerRoleResponseDto,
} from 'src/shared/infrastructure/dto';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { CreateRoleMapper } from '../mappers/create-role.mapper';
import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiExtraModels,
  ApiBearerAuth,
  getSchemaPath,
} from '@nestjs/swagger';
import { CreateRoleResponseDto } from '../dtos/create-role-response.dto';

@ApiTags('Roles')
@ApiExtraModels(SwaggerRoleResponseDto, SwaggerErrorResponseDto)
@ApiBearerAuth()
@Controller('roles')
export class RoleController {
  constructor(
    @Inject(CreateRolePort)
    private readonly createRolePort: CreateRolePort,
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
  ): Promise<ApiResponse<CreateRoleResponseDto>> {
    const commandRole = CreateRoleMapper.toCommand(createRoleDto);
    const role = await this.createRolePort.execute(commandRole);
    return ResponseFactory.created<CreateRoleResponseDto>({
      data: CreateRoleMapper.toResponse(role),
      message: 'Role has been created successfully',
    });
  }
}
