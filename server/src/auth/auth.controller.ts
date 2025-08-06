import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import {
  GoogleAuthRequest,
  IRequestWithCookies,
} from '~/auth/types/auth.types';
import { AuthCookiesService } from '~/auth-cookies/auth-cookies.service';
import { GetCurrentUserId } from '~/common/decorators/get-user-id.decorator';
import { Public } from '~/common/decorators/public.decorator';
import { GoogleGuard } from '~/common/guards/google.guard';
import { RtGuard } from '~/common/guards/rt.guard';
import { TokensDto } from '~/jwt-token/dto/jwt-token.dto';
import { Tokens } from '~/jwt-token/types/jwt-token.types';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  ResendConfirmationDto,
  UserIdResponseDto,
} from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookiesService: AuthCookiesService,
  ) {}

  @Public()
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({ type: UserIdResponseDto })
  @Post('/register')
  async register(@Body() dto: RegisterDto): Promise<{ userId: string }> {
    const userId = await this.authService.register(dto);
    return { userId };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: TokensDto })
  @Post('/login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Tokens> {
    const tokens = await this.authService.login(dto);
    this.authCookiesService.addTokensToCookies(res, tokens);
    return tokens;
  }

  @Public()
  @UseGuards(GoogleGuard)
  @ApiOperation({ summary: 'OAuth2 login by Google (redirect)' })
  @ApiResponse({ status: 302, description: 'Redirect to Google' })
  @Get('google')
  async googleAuth() {}

  @Public()
  @UseGuards(GoogleGuard)
  @ApiOperation({ summary: 'Handling redirect after google login' })
  @ApiOkResponse({ type: TokensDto })
  @Get('/google/callback')
  async googleAuthCallback(
    @Req() req: GoogleAuthRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Tokens> {
    const tokens = await this.authService.googleAuth(req.user);
    this.authCookiesService.addTokensToCookies(res, tokens);
    return tokens;
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOkResponse({ schema: { example: true } })
  async logout(
    @GetCurrentUserId() userId: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<boolean> {
    const result = await this.authService.logout(userId);
    this.authCookiesService.removeTokensFromResponse(response);
    return result;
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(RtGuard)
  @ApiCookieAuth()
  @ApiOkResponse({ type: TokensDto })
  @Post('/refresh')
  async refresh(
    @GetCurrentUserId() userId: string,
    @Req() req: IRequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Tokens> {
    const { refreshToken: refreshTokenFromCookies } = req.cookies;
    if (!refreshTokenFromCookies) {
      throw new BadRequestException('Refresh token missed');
    }
    const tokens = await this.authService.refreshTokens(
      userId,
      refreshTokenFromCookies,
    );

    this.authCookiesService.addTokensToCookies(res, tokens);
    return tokens;
  }

  @Public()
  @ApiQuery({ name: 'token', required: true, type: String })
  @ApiOkResponse({
    schema: { example: { message: 'User confirmed successfully' } },
  })
  @Get('/confirm')
  async confirm(@Query('token') token: string): Promise<{ message: string }> {
    if (!token) {
      throw new BadRequestException('Token is required');
    }
    return this.authService.confirm(token);
  }

  @Public()
  @ApiBody({ type: ResendConfirmationDto })
  @ApiOkResponse({
    schema: { example: { message: 'Confirmation email sent successfully' } },
  })
  @Post('/resend-confirmation')
  async resendConfirmation(
    @Body() dto: ResendConfirmationDto,
  ): Promise<{ message: string }> {
    return this.authService.resendConfirmation(dto.email);
  }
}
