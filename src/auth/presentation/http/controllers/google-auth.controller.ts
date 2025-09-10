import { Controller, Get, Inject, Req, UseGuards } from '@nestjs/common';
import { Public } from 'src/auth/infrastructure/decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';
import { AuthStrategies } from 'src/auth/infrastructure/strategies/strategies.enum';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiOkDto } from 'src/shared/infrastructure/decorators';
import { SwaggerAuthTokensResponseDto } from 'src/shared/infrastructure/dto/swagger-api-response.dto';
import { ApiResponse, ResponseFactory } from 'src/shared/infrastructure/dto';
import { AuthTokensResponse } from 'src/auth/domain/ports/inbound/commands/auth-tokens-response';
import {
  RequestMetadata,
  RequestContext,
} from 'src/shared/infrastructure/decorators/request-metadata.decorator';
import { OAuthLoginPort } from 'src/auth/domain/ports/inbound';
import { LoginWithGoogleMapper } from '../mappers';

@ApiTags('Auth')
@Controller('auth/google')
export class GoogleAuthController {
  constructor(
    @Inject(OAuthLoginPort)
    private readonly loginWithGooglePort: OAuthLoginPort,
  ) {}

  @Public()
  @Get()
  @UseGuards(AuthGuard(AuthStrategies.GOOGLE_OAUTH))
  @ApiOperation({
    summary: 'Redirect to Google consent screen',
    operationId: 'googleOAuthRedirect',
  })
  async googleAuth() {
    return;
  }

  @Public()
  @Get('callback')
  @UseGuards(AuthGuard(AuthStrategies.GOOGLE_OAUTH))
  @ApiOperation({
    summary: 'Google OAuth callback handler',
    operationId: 'googleOAuthCallback',
  })
  @ApiOkDto(SwaggerAuthTokensResponseDto)
  async googleAuthCallback(
    @Req() req: any,
    @RequestMetadata() requestContext: RequestContext,
  ): Promise<ApiResponse<AuthTokensResponse>> {
    const profile = req.user?.profile;
    if (!profile?.email) {
      return ResponseFactory.ok<AuthTokensResponse>({
        data: undefined,
        message: 'Google profile missing email',
      });
    }

    const command = LoginWithGoogleMapper.toCommand(profile, requestContext);
    const tokens = await this.loginWithGooglePort.execute(command);

    return ResponseFactory.ok<AuthTokensResponse>({
      data: tokens,
      message: 'User authenticated with Google successfully',
    });
  }
}
