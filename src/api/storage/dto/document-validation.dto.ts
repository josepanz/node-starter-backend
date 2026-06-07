import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DocumentTypeEnum } from '../const/storage-api.enum';

export class DocumentValidationDTO {
  @ApiProperty({
    example: DocumentTypeEnum.CIP,
    description: 'Tipo de documento',
    enum: DocumentTypeEnum,
  })
  @IsString()
  @IsEnum(DocumentTypeEnum, {
    message: `El tipo de documento debe ser uno de los siguientes: ${Object.values(DocumentTypeEnum).join(', ')}`,
  })
  @IsOptional()
  documentType?: string;

  @ApiProperty({ example: '12345678', description: 'Número de documento' })
  @IsString()
  @IsOptional()
  documentNumber?: string;
}
