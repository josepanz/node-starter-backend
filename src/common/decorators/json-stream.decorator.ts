import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import { JsonStreamInterceptor } from '@core/interceptors/json-stream.interceptor';
import { JSON_STREAM_KEY } from './json-stream.constants';

/**
 * Patrón: decorador compuesto (metadata + interceptor). Marca un handler cuyo valor de retorno
 * puede ser un `IJsonStreamDocument` (ver `common/helpers/json-stream.helper.ts`) y registra el
 * interceptor que lo transmite como JSON chunked, sin materializar el array completo en memoria.
 * @example
 * `@JsonStream() export() { return { arrayKey: 'items', items: asyncGenerator() }; }`
 */
export const JsonStream = (): MethodDecorator =>
  applyDecorators(
    SetMetadata(JSON_STREAM_KEY, true),
    UseInterceptors(JsonStreamInterceptor),
  );
