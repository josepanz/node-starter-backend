# Propuesta: <nombre del change>

## Por qué
Problema u oportunidad en 2-4 oraciones. Qué pasa hoy y a quién afecta.

## Qué cambia
- Cambio 1
- Cambio 2

## Capabilities
### Nuevas
- `<capability>`: qué comportamiento agrega.
### Modificadas
- `<capability>`: qué requisito cambia.

## Impacto
- Módulos afectados: `src/api/<feature>`, `src/modules/<dominio>`
- Variables de entorno nuevas (con default y fallback): `NOMBRE`
- Permisos nuevos: `dominio:accion`
- Migraciones de Prisma: sí/no (descripción)
- Cambios incompatibles de contrato: sí/no

## Plan de rollback
Cómo se revierte si algo falla (variables requeridas, migraciones, datos).

## Fuera de alcance
Lo que explícitamente no se hace en este change.
