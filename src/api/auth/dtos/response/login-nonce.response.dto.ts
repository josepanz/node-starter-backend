import { ApiProperty } from '@nestjs/swagger';

export class LoginNonceResponseDTO {
  @ApiProperty({
    example: '3f9c1d2e7a6b4c58b1e0a9d8c7f6e5d4',
    description: 'Nonce de un solo uso para el próximo login.',
  })
  nonce: string;

  @ApiProperty({ example: 120, description: 'Vigencia del nonce en segundos.' })
  expiresInSeconds: number;
}
