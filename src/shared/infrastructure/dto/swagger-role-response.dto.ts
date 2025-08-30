import { ApiProperty } from '@nestjs/swagger';
// keep this file focused on DTOs; complex schema refs are handled in decorators

export class SwaggerRoleDataDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string | null;

  @ApiProperty()
  realm: string;
}

export class SwaggerRoleResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'Response payload - single role',
    type: SwaggerRoleDataDto,
  })
  data: SwaggerRoleDataDto | SwaggerRoleDataDto[];

  @ApiProperty({ description: 'Human readable message' })
  message?: string;

  @ApiProperty({ example: new Date().toISOString() })
  timestamp: string;
}

export class SwaggerRolesResponseDto extends SwaggerRoleResponseDto {
  @ApiProperty({
    type: SwaggerRoleDataDto,
    isArray: true,
    description: 'Roles list',
  })
  data: SwaggerRoleDataDto[];
}
