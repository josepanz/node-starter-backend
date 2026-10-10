---
description: Crea commits siguiendo Conventional Commits, agrupados por dominio y en español
---

Creá commits temáticos atómicos con el formato convencional del proyecto.

## Formato

```
tipo(alcance): descripción
```

Tipos válidos: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `ci`, `build`, `chore`, `style`, `revert`. El tipo versiona el release (semantic-release), así que se elige por el impacto real.

## Reglas de escritura

- Descripción en español, minúsculas, sin punto final, sin nombres de archivo ni rutas.
- Describí el qué y el por qué, no el cómo.
- Una línea, máximo ~72 caracteres. `commitlint` limita el cuerpo a líneas de 250.
- El alcance es el dominio o área afectada (`auth`, `orders`, `jobs`, `docker`, `k8s`, `context`).
- Sin trailers de coautoría ni atribuciones de herramientas.

Bien: `feat(orders): calcular comisión con mínimo configurable`, `fix(auth): corregir bloqueo prematuro tras el último intento`.
Mal: `fix(auth): modificar auth.service.ts para arreglar bug`.

## Pasos

1. `git diff --staged --stat`; si no hay nada staged, `git status --short`.
2. Agrupá los cambios (staged, unstaged y untracked) en commits por dominio coherente. Nunca mezcles cambios no relacionados.
3. Para cada grupo: `git add <archivos del grupo>` y `git commit -m "mensaje"` sin pedir confirmación.
4. Al terminar mostrá `git log --oneline -10`.
5. No pushees salvo pedido explícito.

## Comportamiento proactivo

Sugerir `/commit` (sin ejecutarlo) solo si la tarea del turno terminó, lint y tests pasan y hay cambios sin commitear. Una línea al final: "Hay cambios sin commitear, ¿hacemos `/commit`?". No repetirlo si se ignoró en el mismo turno.
