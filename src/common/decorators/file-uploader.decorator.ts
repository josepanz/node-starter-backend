import {
  applyDecorators,
  UseInterceptors,
  UnsupportedMediaTypeException,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { memoryStorage } from 'multer';
import { FileUploaderOptions } from '../interfaces/file-uploader-options.interface';
import { ParseFilesPipe } from '../pipes/parse-files.pipe';

export function FileUploader(options: FileUploaderOptions) {
  const {
    fields,
    allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'image/webp'],
    maxSize = 10 * 1024 * 1024,
    required = true,
  } = options;

  // 1. Configuración de Multer
  const interceptor = FileFieldsInterceptor(fields, {
    storage: memoryStorage(),
    limits: { fileSize: maxSize },
    fileFilter: (_req, file, callback) => {
      if (!allowedTypes.includes(file.mimetype)) {
        return callback(
          new UnsupportedMediaTypeException(
            `Tipo ${file.mimetype} no permitido`,
          ),
          false,
        );
      }
      callback(null, true);
    },
  });

  const decorators: Array<
    ClassDecorator | MethodDecorator | PropertyDecorator
  > = [UseInterceptors(interceptor), ApiConsumes('multipart/form-data')];

  // 2. Documentación Dinámica en Swagger
  if (required) {
    const properties: Record<string, SchemaObject> = {};
    const requiredFields: string[] = [];

    fields.forEach((field) => {
      properties[field.name] = {
        type: 'string',
        format: 'binary',
        description: `Archivo: ${field.name} (Max: ${field.maxCount ?? 1})`,
      };
      requiredFields.push(field.name);
    });

    decorators.push(
      ApiBody({
        required: true,
        schema: {
          type: 'object',
          properties,
          required: requiredFields,
        },
      }),
    );
  }

  return applyDecorators(...decorators);
}

/**
 * Decorador de parámetro que integra el Pipe de validación
 */
export function UploadedFilesValidated(
  required = true,
  requiredFields?: string[],
) {
  return required
    ? UploadedFiles(new ParseFilesPipe({ requiredFields }))
    : UploadedFiles();
}
