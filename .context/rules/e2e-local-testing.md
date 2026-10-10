# Pruebas E2E locales con servicios reales

Cómo probar un flujo autenticado de punta a punta contra el backend corriendo localmente (sin mocks ni guards sobreescritos). Complementa a `pnpm test:e2e` (supertest con dependencias mockeadas, en `test/`).

Este flujo levanta servicios: es una acción deliberada del desarrollador, no algo que el asistente deba arrancar por su cuenta en segundo plano.

## Prerrequisitos

- `.env` copiado de `.env.template` (los defaults sirven para desarrollo) y base PostgreSQL accesible con migraciones aplicadas y seed (`pnpm prisma migrate deploy && pnpm seed`).
- Servicios de apoyo opcionales: `docker compose up -d postgres redis mongo mailpit seq` (ver `docker-compose.yml`). Sin ellos los módulos opcionales usan su fallback.
- App: `pnpm start:dev`. Puerto por defecto `3000`, prefijo global `/node-starter-backend/api`, versión `/v1`.

Si el backend depende de otros servicios, el valor de la URL de cada upstream debe incluir el prefijo global y la versión completos y exactos de ese servicio. Un prefijo mal armado da 404 en la llamada saliente, que el manejo de errores traduce a un mensaje genérico indistinguible de un 404 de negocio: ante un 404 apenas se prueba un endpoint nuevo, sospechar primero de la URL configurada.

Cuando una fecha viaja de un backend a otro, serializarla en un formato que el receptor parsee de forma defensiva (ISO completo y solo-fecha), no asumir `YYYY-MM-DD`.

## Secuencia de login (usuario de prueba, no productivo)

1. `GET /auth/nonce` solo si `LOGIN_NONCE_REQUIRED=true`. Usa Basic Auth con las credenciales de la aplicación cliente.
2. Login: Basic Auth de la aplicación cliente + body con `email`, `encryptedPassword` (la contraseña ya encriptada por el cliente, no en claro) y `rememberMe`.

```bash
BASE=http://localhost:3000/node-starter-backend/api/v1
curl --location "$BASE/auth/login" \
  --header 'Content-Type: application/json' \
  --user "$APP_CLIENT_ID:$APP_CLIENT_SECRET" \
  --data '{"email":"user@example.com","encryptedPassword":"<password-ya-encriptado>","rememberMe":false}'
```

La respuesta trae `accessToken`. Usar el del body: las cookies `accessToken`/`refreshToken` se setean `secure` y curl no las reenvía por `http://localhost` plano.

3. Llamar endpoints protegidos con `Authorization: Bearer $ACCESS_TOKEN`:

```bash
curl "$BASE/auth/scope" --header "Authorization: Bearer $ACCESS_TOKEN"
```

Si un endpoint exige contexto adicional (cookie o header de contexto del usuario), replicarlo a mano con el mismo formato que usa el cliente real; los nombres de campo deben coincidir exactamente con la interfaz del guard correspondiente, o el guard responde 403.

## Credenciales M2M (api-clients)

Las integraciones servidor a servidor usan credenciales de `api-clients` con firma HMAC (`HmacSignatureGuard`, ventana `HMAC_TIMESTAMP_WINDOW_SECONDS`, nonce opcional con `HMAC_NONCE_REQUIRED`). El endpoint demo `m2m` sirve para probar la firma; los secretos se obtienen creando el client por la API y se guardan fuera del repo.

## Descubrir rutas sin adivinar

Swagger expone el contrato; listar rutas desde el JSON es más fiable que adivinar:

```bash
curl -s "http://localhost:3000/node-starter-backend/api/swagger-json" | node -e "
const d = JSON.parse(require('fs').readFileSync(0, 'utf8'));
for (const [p, ms] of Object.entries(d.paths)) for (const m of Object.keys(ms)) console.log(m.toUpperCase(), p);
"
```

## Bugs encontrados en E2E

Se corrigen en el momento y se documentan en el change de OpenSpec correspondiente (sección de hallazgos post-implementación). Nunca commitear credenciales, tokens o passwords usados en una prueba.
