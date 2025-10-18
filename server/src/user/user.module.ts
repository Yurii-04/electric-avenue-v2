import { Module } from '@nestjs/common';
import { HashingModule } from '~/hashing/hashing.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [HashingModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
