import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateOrderRequestDTO {
  @ApiProperty({
    example: '100.50',
    description: 'Monto como string decimal positivo (hasta 2 decimales).',
  })
  @IsString()
  @Matches(/^(?!0+(\.0+)?$)\d{1,16}(\.\d{1,2})?$/, {
    message: 'amount debe ser un decimal positivo con hasta 2 decimales',
  })
  amount!: string;

  @ApiPropertyOptional({
    example: 'USD',
    description: 'Código ISO de 3 letras.',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional({ example: 'Pedido de prueba' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
