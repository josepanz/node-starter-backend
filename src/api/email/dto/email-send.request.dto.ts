import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class EmailSendRequestDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email del usuario.',
  })
  @IsEmail()
  email: string;
}
