import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

/** Validates a user identifier against the positive PostgreSQL Int range. */
export class FindOneUserDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  id: number;
}
