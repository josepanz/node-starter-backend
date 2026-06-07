import { ApiProperty } from '@nestjs/swagger';

export class CreateResponseDataDTO<T> {
  @ApiProperty({ example: 'Operación exitosa' })
  message!: string;
  data!: T;
}
