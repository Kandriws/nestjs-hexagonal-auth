import { ApiProperty } from '@nestjs/swagger';

export class SwaggerMessageResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'Optional data',
    nullable: true,
    required: false,
  })
  data?: unknown;

  @ApiProperty({ description: 'Human readable message' })
  message?: string;

  @ApiProperty({ example: new Date().toISOString() })
  timestamp: string;
}

export class SwaggerAuthTokensDataDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}

export class SwaggerAuthTokensResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: SwaggerAuthTokensDataDto })
  data: SwaggerAuthTokensDataDto;

  @ApiProperty({ description: 'Human readable message' })
  message?: string;

  @ApiProperty({ example: new Date().toISOString() })
  timestamp: string;
}

export class SwaggerEnableTwoFactorDataDto {
  @ApiProperty()
  otpauthUri: string;

  @ApiProperty({ required: false })
  secret?: string;
}

export class SwaggerEnableTwoFactorResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: SwaggerEnableTwoFactorDataDto })
  data: SwaggerEnableTwoFactorDataDto;

  @ApiProperty({ description: 'Human readable message' })
  message?: string;

  @ApiProperty({ example: new Date().toISOString() })
  timestamp: string;
}
