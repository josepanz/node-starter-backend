import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Readable } from 'stream';
import { JSON_STREAM_KEY } from '@common/decorators/json-stream.constants';
import {
  IJsonStreamDocument,
  JsonStreamHelper,
} from '@common/helpers/json-stream.helper';

/**
 * Patrón: Decorator/Interceptor. Transmite como JSON chunked (`Transfer-Encoding: chunked`, sin
 * `Content-Length`) el valor de un handler marcado con `@JsonStream()` cuando tiene la forma de
 * un `IJsonStreamDocument`; cualquier otro valor pasa intacto (mismo criterio defensivo que
 * `FileDownloadInterceptor`), así un handler puede mezclar ramas en streaming y no streaming.
 */
@Injectable()
export class JsonStreamInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const shouldStream = this.reflector.get<boolean | undefined>(
      JSON_STREAM_KEY,
      context.getHandler(),
    );

    if (!shouldStream) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data: unknown) => {
        if (!JsonStreamInterceptor.isStreamDocument(data)) {
          return data;
        }

        return new StreamableFile(
          Readable.from(JsonStreamHelper.stream(data), { objectMode: false }),
          { type: 'application/json' },
        );
      }),
    );
  }

  /**
   * Determina si el valor resuelto por el handler es realmente un
   * `IJsonStreamDocument` (tiene `arrayKey`/`items`), en vez de asumirlo solo
   * por la presencia del metadata del decorador.
   * @param value Valor resuelto por el handler
   * @returns `true` si `value` tiene la forma de `IJsonStreamDocument`
   */
  private static isStreamDocument(
    value: unknown,
  ): value is IJsonStreamDocument<unknown, unknown> {
    return (
      !!value &&
      typeof value === 'object' &&
      'arrayKey' in value &&
      'items' in value
    );
  }
}
