import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from '~/common/guards/at.guard';
import { AuthModule } from './auth/auth.module';
import { AuthCookiesModule } from './auth-cookies/auth-cookies.module';
import { CategoryModule } from './category/category.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { HashingModule } from './hashing/hashing.module';
import { JwtTokenModule } from './jwt-token/jwt-token.module';
import { MailModule } from './mail/mail.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    HashingModule,
    MailModule,
    JwtTokenModule,
    AuthCookiesModule,
    CategoryModule,
    ProductModule,
    CloudinaryModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
