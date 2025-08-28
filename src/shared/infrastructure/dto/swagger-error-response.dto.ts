import { ApiProperty } from '@nestjs/swagger';

export class SwaggerErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ description: 'Error message' })
  message: string;

  @ApiProperty({ example: new Date().toISOString() })
  timestamp: string;
}
