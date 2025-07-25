import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

import { RegisterDto } from '~/auth/dto/auth.dto';
import { HashingService } from '~/hashing/hashing.service';
import { PrismaService } from '~/prisma/prisma.service';

import { UserResponseDto } from './dto/user.dto';

type Verification = {
  verificationToken: string;
  verificationTokenExpiresAt: Date;
};

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingService,
  ) {}

  async save(dto: RegisterDto, verification: Verification): Promise<User> {
    const hashedPassword = await this.hashingService.hash(dto.password);
    const { verificationToken, verificationTokenExpiresAt } = verification;
    return this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        hashedPassword: hashedPassword,
        verificationToken,
        verificationTokenExpiresAt,
        confirmed: false,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async getMe(id: string): Promise<UserResponseDto | null> {
    return this.prisma.user.findUnique({
      omit: {
        hashedPassword: true,
        hashedRt: true,
      },
      where: { id },
    });
  }
}
