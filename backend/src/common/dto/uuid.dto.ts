import { Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class UuidParamDto {
  @ApiProperty({ format: 'uuid' })
  @Matches(UUID_REGEX, { message: 'id must be a valid UUID' })
  id: string;
}
