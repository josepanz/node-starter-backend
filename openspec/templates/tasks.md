# Tareas: <nombre del change>

## 1. Configuración
- [ ] 1.1 Agregar variables a `config-schema.ts`, al loader y a `.env.template`
- [ ] 1.2 Agregar permisos a `src/common/enum/permissions.enum.ts` y al seed

## 2. Datos
- [ ] 2.1 Test del `DBService` (rojo)
- [ ] 2.2 Modelo en `prisma/schema.prisma` y migración
- [ ] 2.3 `DBService` (verde)

## 3. API
- [ ] 3.1 DTOs de request y response con validación y Swagger
- [ ] 3.2 Test del `ApiService` (rojo)
- [ ] 3.3 `ApiService` y controller; docs en `docs/<feature>-api.docs.ts`
- [ ] 3.4 Registro en `src/api/api.module.ts`

## 4. Cierre
- [ ] 4.1 `pnpm prisma generate`, `pnpm build`, `pnpm lint`, `pnpm test` en verde
- [ ] 4.2 Prueba E2E local (`.context/rules/e2e-local-testing.md`)
- [ ] 4.3 Documentación actualizada
