# Autenticación y permisos

## Qué guard va en cada tipo de endpoint

| Tipo | Guard / decorador | Ejemplo |
|---|---|---|
| Usuario autenticado con permisos | `@WithPermissions([PERMISSIONS.X.Y])` (compone `JwtAuthGuard` + `PermissionsGuard` + Swagger) | casi todo `api/*` |
| Pre-login (login, nonce, recuperación de contraseña, onboarding) | `@UseGuards(BasicAuthGuard)` + `@ApiBasicAuth()`; sin JWT | `auth/login`, `auth/nonce` |
| Machine-to-machine | credenciales de `api-clients` + `HmacSignatureGuard` (y `ApiClientThrottlerGuard`) | `m2m` |
| Infra (salud) | sin guard | `healthcheck` |

Nunca implementar validación de token inline: siempre los guards y decoradores de `modules/auth` (`@auth/*`). Nunca usar `AuthGuard('jwt')` suelto sin el patrón compuesto.

## Permisos: naming y enum centralizado

- Formato `dominio:accion` (por ejemplo `order:create`, `order:read`, `message.content:read`).
- Todo permiso nuevo se agrega a `PERMISSIONS` en `src/common/enum/permissions.enum.ts`. Nunca strings de permisos hardcodeados en controllers o services.
- `@WithPermissions([...])` exige al menos uno por defecto; `{ mode: 'all' }` los exige todos.
- Las lecturas llevan `:read` y las escrituras `:create`/`:update`; las acciones sensibles (rotar un secreto, requeue) tienen permiso propio.
- Un permiso nuevo se agrega también al seed (`prisma/seed.ts`) y a los roles que correspondan.

```typescript
@WithPermissions([PERMISSIONS.ORDER.READ])
@Get()
async getList(@Query() query: GetOrdersListQueryDTO): Promise<GetOrdersListResponseDTO> { ... }

// Acción que necesita la identidad del operador
@WithPermissions([PERMISSIONS.ORDER.UPDATE])
@Patch(':referenceId/approve')
async approve(@Param() param: ApproveOrderParamDTO, @User() user: Users) { ... }
```

## Reglas

- Guards de autenticación en todos los controllers de `api/*`, salvo los endpoints pre-login (Basic Auth) y la salud.
- Un endpoint que opera sobre recursos de un tenant filtra por el tenant del contexto autenticado en el `where`; "no existe" y "no es tuyo" responden el mismo 404.
- Rate limiting con `@RateLimit('<perfil>')` (auth, search, upload, default) según la sensibilidad del endpoint.
- Los permisos efectivos se resuelven por usuario y se cachean (`PERMISSIONS_CACHE_TTL_SECONDS`); un cambio de rol puede tardar hasta ese TTL en reflejarse.
- Contraseñas: política y lockout se configuran por env (`PASSWORD_*`, `MAX_LOGIN_ATTEMPTS`, `LOCKOUT_MINUTES`); nunca se loguean ni se devuelven.
