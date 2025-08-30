import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ type: SwaggerRoleDataDto })
  data: SwaggerRoleDataDto;

  @ApiProperty({ description: 'Human readable message' })
  message?: string;

  @ApiProperty({ example: new Date().toISOString() })
  timestamp: string;
}
