import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
  StreamableFile,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { Buffer } from 'buffer';
import { Readable } from 'stream';
import { DOWNLOAD_FILE_KEY } from '@common/decorators/file-download.decorator';

export type ExportFormat = 'xlsx' | 'pdf' | 'csv';

export interface IDownloadResponse {
  buffer: Buffer;
  filename: string;
  format: ExportFormat;
}

@Injectable()
export class FileDownloadInterceptor implements NestInterceptor {
  private readonly mimeTypes: Record<ExportFormat, string> = {
    pdf: 'application/pdf',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
  };

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isDownload = this.reflector.get<boolean>(
      DOWNLOAD_FILE_KEY,
      context.getHandler(),
    );

    if (!isDownload) {
      return next.handle();
    }

    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data: IDownloadResponse) => {
        if (!data || !data.buffer || !data.filename || !data.format) {
          throw new InternalServerErrorException(
            'El servicio no retornó la estructura requerida para descargas (buffer, filename, format).',
          );
        }

        const contentType =
          this.mimeTypes[data.format] || 'application/octet-stream';

        response.set({
          'Content-Disposition': `attachment; filename="${data.filename}"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        });

        return new StreamableFile(Readable.from(data.buffer), {
          type: contentType,
          length: data.buffer.length,
        });
      }),
    );
  }
}
