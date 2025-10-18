import { ApiProperty } from '@nestjs/swagger';
import { PageMetaDtoParameters } from '~/common/interfaces';

export class PageMetaDto {
  constructor({ pageOptionsDto, itemCount }: PageMetaDtoParameters) {
    this.page = pageOptionsDto.page ?? 1;
    this.take = pageOptionsDto.take ?? 10;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.take);
  }

  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly take: number;

  @ApiProperty()
  readonly itemCount: number;

  @ApiProperty()
  readonly pageCount: number;
}
