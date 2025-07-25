import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { HashingModule } from '~/hashing/hashing.module';
import { MailModule } from '~/mail/mail.module';
import { UserModule } from '~/user/user.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy } from './strategies/at.strategy';
import { RtStrategy } from './strategies/rt.strategy';

@Module({
  imports: [UserModule, HashingModule, MailModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy],
})
export class AuthModule {}
