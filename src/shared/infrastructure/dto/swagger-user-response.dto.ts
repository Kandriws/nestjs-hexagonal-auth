import { ApiProperty } from '@nestjs/swagger';

export class SwaggerUserDataDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ required: false })
  verifiedAt?: string | null;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class SwaggerUserResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'Response payload - single user',
    type: SwaggerUserDataDto,
  })
  data: SwaggerUserDataDto | SwaggerUserDataDto[];

  @ApiProperty({ description: 'Human readable message' })
  message?: string;

  @ApiProperty({ example: new Date().toISOString() })
  timestamp: string;
}

export class SwaggerUsersResponseDto extends SwaggerUserResponseDto {
  @ApiProperty({
    type: SwaggerUserDataDto,
    isArray: true,
    description: 'Users list',
  })
  data: SwaggerUserDataDto[];
}
