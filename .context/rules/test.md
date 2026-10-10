# Reglas de testing

## Regla base

Todo archivo con lógica lleva su `.spec.ts` al lado: services, helpers, guards, pipes, filters, validators, utils, jobs, handlers y DTOs con validadores o transformaciones propias. Una feature nueva incluye sus tests en el mismo PR.

Se excluyen explícitamente (ya están en `collectCoverageFrom`): `*.module.ts`, `main.ts`, `*.dto.ts`, `*.entity.ts`, `*.interface.ts`, `*.enum.ts`, `index.ts`. El umbral global de `jest.config.ts` es bloqueante en `test:cov`; si no se puede cubrir algo, se excluye con motivo, nunca se baja el umbral.

## Reglas de escritura

- Nombres en español que describen el COMPORTAMIENTO, no el método.
  - Mal: `it('llama a prisma.create')`
  - Bien: `it('debe retornar la orden creada con su referencia generada')`
- Patrón AAA (Arrange / Act / Assert); nunca mezclar las fases en una línea.
- `jest.clearAllMocks()` en `afterEach`.
- Mockear TODA dependencia externa (base, HTTP, proveedores, Redis, Mongo, SMTP, S3). Un unit test jamás toca un servicio real.
- Nunca datos reales: ni ids de producción, ni tokens, ni emails de personas, ni claves.
- Un `describe` por método público; mínimo camino feliz + camino de error relevante.
- Un test por comportamiento: un `it` con tres `expect` de cosas distintas son tres tests.

## Mocks: declarar como `const` a nivel de módulo

Nunca `jest.fn()` inline dentro de `useValue`: dispara `@typescript-eslint/unbound-method` al hacer `expect(service.metodo)`.

```typescript
const mockCreate = jest.fn();
const mockFindUnique = jest.fn();

{ provide: OrdersDBService, useValue: { create: mockCreate, findUnique: mockFindUnique } }

expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ reference: 'ORD-1' }));
```

Mocks reutilizables: si el mismo mock aparece en 3 o más specs, se mueve a `test/mocks/` (Prisma, `HttpService`, proveedores). Uno usado en un solo spec se queda en el spec.

## Qué probar por tipo de archivo

| Archivo | Mínimo |
|---|---|
| `<Dominio>DBService` | camino feliz; `HttpException` que sale intacta; error genérico a 500; log con contexto |
| `<Feature>ApiService` | orquestación con los módulos mockeados; mapeo a DTO de respuesta |
| Controller | delega y no transforma: llamó al service con los argumentos correctos |
| Guard | permitido; credencial ausente; credencial inválida; sin permiso |
| Filter | un caso por cada código mapeado + el caso por defecto |
| Validator / DTO custom | valores aceptados, rechazados, defaults, transformación |
| Helper / util | ramas y bordes (vacío, null, límite) |
| Job / handler | `run()` feliz; fallo no propaga y se loguea; `isEnabled()`; idempotencia |
| Provider con fallback | con credenciales usa el real; sin ellas cae al noop/console sin lanzar |

Para un método con `try/catch`: una `HttpException` lanzada adentro sale intacta (si no, el `catch` puede estar tragándose los 404), un error genérico se convierte en `InternalServerErrorException`, y se logueó con contexto.

## Guards en tests de controllers

```typescript
.overrideGuard(JwtAuthGuard).useValue({ canActivate: jest.fn().mockReturnValue(true) })
```

## Qué NO testear

- Configuración de `*.module.ts`.
- Respuestas reales de upstream: se mockea `HttpService`.
- Tests white-box que solo afirman llamadas internas sin valor de comportamiento.

## Comandos

```bash
pnpm test                              # suite completa
pnpm test <ruta>.spec.ts            # un spec
pnpm test:watch                        # modo watch
pnpm test:cov                          # cobertura (aplica el umbral)
pnpm test:e2e                          # e2e con supertest (test/*.e2e-spec.ts)
```

En máquinas con pocos recursos o en CI, limitar workers: `pnpm test --maxWorkers=2`.

## Cierre de tarea

`pnpm prisma generate` → `pnpm build` → `pnpm lint` → `pnpm test`. Sin warnings ni errores nuevos de test, format o lint. Un fallo que ya existía en la rama base se reporta, no se arregla de contrabando.
