import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secret_password' })
  @IsString()
  @Length(6, 100)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @Length(2, 100)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @Length(2, 100)
  lastName: string;
}

export class LoginDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'secret_password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UserIdResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;
}

export class EmailConfirmationResponseDto {
  @ApiProperty({
    example: 'User confirmed successfully',
  })
  message: string;
}
