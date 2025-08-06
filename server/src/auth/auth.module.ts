import { Module } from '@nestjs/common';
import { GoogleStrategy } from '~/auth/strategies/google.strategy';
import { AuthCookiesModule } from '~/auth-cookies/auth-cookies.module';
import { HashingModule } from '~/hashing/hashing.module';
import { JwtTokenModule } from '~/jwt-token/jwt-token.module';
import { MailModule } from '~/mail/mail.module';
import { UserModule } from '~/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy } from './strategies/at.strategy';
import { RtStrategy } from './strategies/rt.strategy';

@Module({
  imports: [
    UserModule,
    HashingModule,
    MailModule,
    JwtTokenModule,
    AuthCookiesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy, GoogleStrategy],
})
export class AuthModule {}
