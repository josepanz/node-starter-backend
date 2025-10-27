import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class LoginUserResponseDto {
  @ApiProperty({ example: true, description: 'Indica login exitoso' })
  @IsBoolean()
  login: boolean;

  @ApiProperty({
    example:
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Impvc2VwYW56YTFAZ21haWwuY29tIiwiaWF0IjoxNzU2ODQyMTU5LCJleHAiOjE3NTY4NDU3NTl9.DaHAKS9Nl8d2dz5q7FPfo2lObnCeo0Gu4YegPFOCMqBf_c_Dm0jpdrLSLdK_SQQKBVXeyXK0g_o4E2vXp3vd2SoYw8olo_Ipj8UUTusjnw-WyeSlihrenyzWmWiPWwu2DcoUkihIrQVHAUFqqHL9mCJMlwrZdMNTOZZZNkBzZQ_F5-n1FYSMw-wvgtVpb-ryZC4zTRMDclTrlpyDauYIle8bX7930XjbZQX2iRSo03GqZpWy66pDMOp8akEpjhnNdbjtoIoFH0JdMNT6-2jlK07EEnl6tNIMplV--lApmEIXzdrNt5Zor5I7pUONrorsu5y_bnFt0ODC2ufIgOu9zg',
    description: 'Token de acceso del usuario.',
  })
  @IsString()
  @IsOptional()
  accessToken?: string | null;

  @IsString()
  @IsOptional()
  refreshToken?: string | null;

  @ApiProperty({
    example: true,
    description: 'Indica si el usuario debe cambiar su contraseña',
  })
  @IsBoolean()
  requiredNewPassword?: boolean;
}
