import { ApiProperty } from '@nestjs/swagger';

export class SwaggerErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ description: 'Error message' })
  message: string;

  @ApiProperty({
    description: 'Machine-friendly error code',
    example: 'ERROR_CODE_EXAMPLE',
  })
  code?: string;

  @ApiProperty({ example: new Date().toISOString() })
  timestamp: string;
}
