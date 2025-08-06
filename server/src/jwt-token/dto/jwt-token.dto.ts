import { ApiProperty } from '@nestjs/swagger';

export class TokensDto {
  @ApiProperty({ example: 'access.jwt.token.here' })
  accessToken: string;

  @ApiProperty({ example: 'refresh.jwt.token.here' })
  refreshToken: string;
}
