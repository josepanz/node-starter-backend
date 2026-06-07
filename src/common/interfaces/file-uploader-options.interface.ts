import { MulterField } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export interface FileUploaderOptions {
  fields: MulterField[];
  allowedTypes?: string[];
  maxSize?: number;
  required?: boolean; // Nueva opción
}
