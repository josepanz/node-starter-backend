# Manejo de errores y logging

## Capas de defensa

| Capa | Quién | Qué atrapa |
|---|---|---|
| 1. Excepción de negocio | el service, explícita | `NotFoundException`, `BadRequestException`, `ConflictException`, `ForbiddenException`: casos esperados |
| 2. `try/catch` + `ErrorHelper` | todo método público de service con I/O | lo inesperado: loguea con contexto y lanza 500 |
| 3. `PrismaClientExceptionFilter` | disponible en `common/filters/`, hoy NO registrado en `main.ts` (registrarlo con `useGlobalFilters` antes del filtro genérico si se quiere el mapeo) | errores de Prisma mapeados a su HTTP correcto |
| 4. `TransientConnectionExceptionFilter` | global, envuelve a `AllExceptionsFilter` en `main.ts` | red de contención: 503 para fallas transitorias; el resto lo reporta `AllExceptionsFilter` (Sentry opcional) |

Las capas conviven: `ErrorHelper` re-lanza tal cual las `HttpException`, así que una excepción de negocio nunca se degrada a 500.

## Fallas transitorias: 503, no 500

`TransientConnectionErrorHelper.isTransient(error)` reconoce `ECONNREFUSED`, `ECONNRESET`, `ETIMEDOUT`, `EHOSTUNREACH`, `ENETUNREACH` y los timeouts de `pg`. Se consulta desde el filtro global para que un pool agotado o una base inalcanzable salga como 503 "reintente" y no como un 500 que parece un bug. La lista vive en un solo lugar.

## Excepciones de negocio

Mensaje claro y accionable. "No existe" y "no es tuyo" devuelven el mismo 404, nunca un 403, para no filtrar la existencia del recurso ajeno.

## `try/catch` con `ErrorHelper`

```typescript
async create(data: Prisma.OrderCreateInput): Promise<Order> {
  try {
    const order = await this.prisma.extended.order.create({ data });
    this.logger.log(`Orden creada: ${order.referenceId}`);
    return order;
  } catch (error) {
    ErrorHelper.handleError(error, 'Error al crear la orden', this.logger);
  }
}
```

`ErrorHelper.handleError(error, context, logger)` (`@common/helpers/error.helper`) retorna `never`. El `context` dice qué se intentaba hacer, no qué falló.

## `PrismaClientExceptionFilter`

Mapeo que implementa (aplica una vez registrado, ver la tabla de capas):

| Código | HTTP | Cuándo |
|---|---|---|
| `P2002` | 409 | violación de UNIQUE |
| `P2003` | 400 | FK inválida |
| `P2021` | 503 | tabla inexistente: migración sin aplicar |
| `P2024` | 503 | pool agotado / alta latencia |
| `P2025` | 404 | el registro no existe |
| resto | 500 | con el código en el mensaje |

El orden de registro en `main.ts` importa: el filtro genérico va después de los específicos o los tapa.

## Logging

- Una instancia de `Logger` de Nest por clase (`new Logger(Clase.name)`); en runtime el transporte es `nestjs-pino` (con Seq opcional).
- `log`: evento de negocio completado. `warn`: anómalo pero manejado. `error`: solo desde `ErrorHelper` o el filtro, no a mano. `debug`/`verbose` no se usan en código que llega a `develop`.
- Cada request lleva `traceId` (`TraceIdMiddleware`); se incluye como tag en los reportes de Sentry (solo 5xx).

### Nunca loguear

- Emails completos, teléfonos, tokens (truncar a 8 caracteres), secretos, headers `Authorization`, contraseñas, credenciales.
- El body entero de una request (hay redacción central en `core/observability/redaction.ts`; no la esquives).

## Qué verificar en un spec de error

1. Una `HttpException` lanzada adentro sale intacta (mismo tipo y mensaje).
2. Un error genérico se convierte en `InternalServerErrorException`.
3. Se llamó al logger con el contexto esperado.
