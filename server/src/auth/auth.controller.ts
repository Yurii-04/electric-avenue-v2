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
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';

import { IRequestWithCookies } from '~/auth/types/auth.types';
import { AuthCookiesService } from '~/auth-cookies/auth-cookies.service';
import { GetCurrentUserId } from '~/common/decorators/get-user-id.decorator';
import { Public } from '~/common/decorators/public.decorator';
import { RtGuard } from '~/common/guards/rt.guard';

import { AuthService } from './auth.service';
import {
  EmailConfirmationResponseDto,
  LoginDto,
  RegisterDto,
  UserIdResponseDto,
} from './dto/auth.dto';

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
  @ApiOkResponse({ type: UserIdResponseDto })
  @Post('/login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ userId: string }> {
    const { tokens, userId } = await this.authService.login(dto);
    this.authCookiesService.addTokensToCookies(res, tokens);
    return { userId };
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiOkResponse({ example: true })
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
  @Post('/refresh')
  async refresh(
    @GetCurrentUserId() userId: string,
    @Req() req: IRequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken: refreshTokenFromCookies } = req.cookies;
    if (!refreshTokenFromCookies) {
      throw new BadRequestException('Refresh token missed');
    }

    const tokens = await this.authService.refreshTokens(
      userId,
      refreshTokenFromCookies,
    );

    this.authCookiesService.addTokensToCookies(res, tokens);
  }

  @Public()
  @ApiQuery({ name: 'token', required: true, type: String })
  @ApiOkResponse({ type: EmailConfirmationResponseDto })
  @Get('/confirm')
  async confirm(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    return this.authService.confirm(token);
  }

  @Public()
  @Get('/resend-confirmation')
  async resendConfirmation() {
    return this.authService.resendConfirmation('');
  }
}
