import { randomBytes } from 'crypto';

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { HashingService } from '~/hashing/hashing.service';
import { JwtTokenService } from '~/jwt-token/jwt-token.service';
import { Tokens } from '~/jwt-token/types/jwt-token.types';
import { MailService } from '~/mail/mail.service';
import { PrismaService } from '~/prisma/prisma.service';
import { UserService } from '~/user/user.service';

import { constants } from './consts/consts';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly hashingService: HashingService,
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

    const tokens = await this.jwtTokenService.signTokens({
      email: user.email,
      sub: user.id,
    });
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

  async refreshTokens(userId: string, rt: string): Promise<Tokens> {
    const user = await this.userService.findById(userId);
    if (!user?.hashedRt) {
      throw new ForbiddenException();
    }

    const rtMatches = await this.hashingService.compare(rt, user.hashedRt);
    if (!rtMatches) {
      throw new ForbiddenException();
    }

    const tokens = await this.jwtTokenService.signTokens({
      email: user.email,
      sub: user.id,
    });

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

  async resendConfirmation(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.confirmed) {
      throw new BadRequestException('User already confirmed');
    }

    const verificationToken = this.generateVerificationToken();

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpiresAt: constants.verificationTokenExpiresAt,
      },
    });

    await this.mailService.sendConfirmationEmail(user.email, verificationToken);

    return { message: 'Confirmation email sent successfully' };
  }
}
