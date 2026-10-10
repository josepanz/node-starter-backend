import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IsPhoneNumber } from '@common/validators/is-phone-number.validator';

export class SendSmsRequestDTO {
  @ApiProperty({
    example: '+14155550100',
    description:
      'Teléfono internacional (+<país><número>). Con PHONE_DEFAULT_COUNTRY_CODE se acepta también formato nacional.',
  })
  @IsPhoneNumber()
  to!: string;

  @ApiProperty({ example: 'Tu código es 123456', maxLength: 1600 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1600)
  text!: string;
}
