import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseFilesPipe implements PipeTransform {
  /**
   * @param options.requiredFields Lista de campos que deben estar presentes obligatoriamente
   */
  constructor(private readonly options?: { requiredFields?: string[] }) {}

  transform(files: Record<string, Express.Multer.File[]>) {
    // 1. Verificar si se subió algo
    if (!files || Object.keys(files).length === 0) {
      throw new BadRequestException('No se han proporcionado archivos');
    }

    // 2. Verificar campos obligatorios (si se definieron)
    if (this.options?.requiredFields) {
      for (const field of this.options.requiredFields) {
        if (!files[field] || files[field].length === 0) {
          throw new BadRequestException(
            `El campo de archivo '${field}' es obligatorio`,
          );
        }
      }
    }

    return files;
  }
}
