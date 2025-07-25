import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class UserResponseDto
  implements Omit<User, 'hashedRt' | 'hashedPassword'>
{
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  photo: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  confirmed: boolean;

  @ApiProperty()
  verificationToken: string | null;

  @ApiProperty()
  verificationTokenExpiresAt: Date | null;
}
