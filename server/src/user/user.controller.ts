import { Controller, Get } from '@nestjs/common';
import { ApiNotFoundResponse, ApiResponse } from '@nestjs/swagger';
import { GetCurrentUserId } from '~/common/decorators/get-user-id.decorator';
import { UserResponseDto } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  @ApiResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found (null)' })
  async getMe(
    @GetCurrentUserId() userId: string,
  ): Promise<UserResponseDto | null> {
    return this.userService.getMe(userId);
  }
}
