import { randomBytes } from 'crypto';

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

import { HashingService } from '~/hashing/hashing.service';
import { MailService } from '~/mail/mail.service';
import { PrismaService } from '~/prisma/prisma.service';
import { UserService } from '~/user/user.service';

import { constants } from './consts/consts';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtPayload, Tokens } from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly hashingService: HashingService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const oldUser = await this.userService.findByEmail(dto.email);
    if (oldUser) {
      throw new BadRequestException('User already exists');
    }

    const verificationToken = this.generateVerificationToken();
    const user = await this.userService.save(dto, {
      verificationToken,
      verificationTokenExpiresAt: constants.verificationTokenExpiresAt,
    });

    await this.mailService.sendConfirmationEmail(user.email, verificationToken);
    return user.id;
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new ForbiddenException('Wrong email or password');
    }

    if (!user.confirmed) {
      throw new ForbiddenException('Please confirm your email before login');
    }

    const passwordMatches = await this.hashingService.compare(
      dto.password,
      user.hashedPassword,
    );
    if (!passwordMatches) {
      throw new ForbiddenException('Wrong email or password');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRt(user.id, tokens.refreshToken);
    return { tokens, userId: user.id };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRt: null },
    });

    return true;
  }

  generateVerificationToken() {
    return randomBytes(32).toString('hex');
  }

  async getTokens(userId: string, email: string) {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('AT_SECRET'),
        expiresIn: constants.EXPIRE_MINUTES_ACCESS_TOKEN + 'm',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('RT_SECRET'),
        expiresIn: constants.EXPIRE_DAY_REFRESH_TOKEN + 'd',
      }),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  async refreshTokens(userId: string, rt: string): Promise<Tokens> {
    const user = await this.userService.findById(userId);
    if (!user?.hashedRt) {
      throw new ForbiddenException();
    }

    const rtMatches = await this.hashingService.compare(rt, user.hashedRt);
    if (!rtMatches) {
      throw new ForbiddenException();
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRt(user.id, tokens.refreshToken);

    return tokens;
  }

  async updateRt(userId: string, rt: string): Promise<void> {
    const hashedRt = await this.hashingService.hash(rt, 10);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: { hashedRt },
    });
  }

  addTokensToCookies(res: Response, at: string, rt: string) {
    res.cookie(constants.ACCESS_TOKEN_NAME, at, {
      ...this.getCookieOptions(),
      maxAge: constants.EXPIRE_MINUTES_ACCESS_TOKEN * 60 * 1000,
    });
    res.cookie(constants.REFRESH_TOKEN_NAME, rt, {
      ...this.getCookieOptions(),
      maxAge: constants.EXPIRE_DAY_REFRESH_TOKEN * 24 * 60 * 60 * 1000,
    });
  }

  removeTokensFromResponse(res: Response) {
    res.clearCookie(constants.REFRESH_TOKEN_NAME, this.getCookieOptions());
    res.clearCookie(constants.ACCESS_TOKEN_NAME, this.getCookieOptions());
  }

  private getCookieOptions() {
    return {
      httpOnly: true,
      sameSite: 'strict' as const,
      secure: process.env.NODE_ENV === 'prod',
    };
  }

  async confirm(token: string) {
    const user = await this.prisma.user.findUnique({
      where: { verificationToken: token },
    });
    if (!user) {
      throw new BadRequestException('Invalid token');
    }

    if (user.confirmed) {
      return { message: 'User already confirmed' };
    }

    if (
      user.verificationTokenExpiresAt &&
      user.verificationTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException('Token expired');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        confirmed: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      },
    });

    return { message: 'User confirmed successfully' };
  }
}
