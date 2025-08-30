import { ApiProperty } from '@nestjs/swagger';

export class SwaggerPermissionDataDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  realm: string;
}

export class SwaggerPermissionResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'Response payload - single permission',
    type: SwaggerPermissionDataDto,
  })
  data: SwaggerPermissionDataDto | SwaggerPermissionDataDto[];

  @ApiProperty({ description: 'Human readable message' })
  message?: string;

  @ApiProperty({ example: new Date().toISOString() })
  timestamp: string;
}

export class SwaggerPermissionsResponseDto extends SwaggerPermissionResponseDto {
  @ApiProperty({
    type: SwaggerPermissionDataDto,
    isArray: true,
    description: 'Permissions list',
  })
  data: SwaggerPermissionDataDto[];
}
