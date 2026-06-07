import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  ArrayNotEmpty,
  ArrayUnique,
} from 'class-validator';

export class DeleteStorageRequestDTO {
  @ApiProperty({
    description:
      'Lista de claves (keys) de los archivos a eliminar del storage',
    example: ['onboarding/docs/image1.png', 'onboarding/docs/image2.pdf'],
    type: [String], // Importante para que Swagger reconozca que es un array de strings
  })
  @IsArray({ message: 'keys debe ser un arreglo' })
  @ArrayNotEmpty({ message: 'El arreglo de keys no puede estar vacío' })
  @ArrayUnique({
    message: 'No se permiten keys duplicados en la misma petición',
  })
  @IsString({ each: true, message: 'Cada key debe ser una cadena de texto' })
  @IsNotEmpty({ each: true, message: 'Las keys no pueden ser strings vacíos' })
  keys!: string[];
}
