# Diseño: <nombre del change>

## Contexto
Estado actual relevante y restricciones.

## Objetivos y no objetivos
- Objetivo:
- No objetivo:

## Mapeo de capas
| Archivo | Capa | Acción |
|---|---|---|
| `src/api/<feature>/controllers/...` | api | crear |
| `src/modules/<dominio>-db/services/...` | modules | crear |

## Flujo
```mermaid
sequenceDiagram
  participant C as Controller
  participant A as ApiService
  participant D as DBService
  C->>A: request DTO
  A->>D: operación
  D-->>A: entidad
  A-->>C: response DTO
```

## Endpoints
| Método y ruta | Guard y permiso | Request | Response | Errores |
|---|---|---|---|---|
| `POST /v1/<recurso>` | `@WithPermissions([PERMISSIONS.X.CREATE])` | `CreateXRequestDTO` | `CreateXResponseDTO` | 400, 401, 403, 409 |

## Decisiones
| Decisión | Alternativas | Fundamento |
|---|---|---|
| | | |

## Riesgos y mitigaciones
-

## Hallazgos post-implementación
Se completa durante las pruebas E2E.
