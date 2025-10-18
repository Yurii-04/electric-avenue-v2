import { Module } from '@nestjs/common';
import { AuthCookiesService } from './auth-cookies.service';

@Module({
  providers: [AuthCookiesService],
  exports: [AuthCookiesService],
})
export class AuthCookiesModule {}
