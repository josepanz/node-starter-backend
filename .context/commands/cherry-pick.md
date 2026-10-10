---
description: Pone al día la rama actual con develop (u otra base) sin pisar el alcance de la feature, o trae commits puntuales
argument-hint: "[rama base, default develop] [hash(es) de commit para traer solo esos]"
---

Sincronizá la rama actual con `develop` (u otra base indicada) trayendo solo lo necesario para que el merge/PR de la feature quede limpio, sin pisar cambios de otras features.

## Guardrail

Verificá `git branch --show-current`. Si es `develop`, `qa`, `release`, `master` o `main`: no ejecutes nada y avisá que este comando es solo para ramas de feature. Nunca commitea ni pushea hacia una rama protegida.

## Pasos

1. Modo: sin hashes = sync completo (rama base = primer argumento o `develop`); con hashes = cherry-pick puntual. `git fetch origin` primero.
2. Diagnóstico previo (obligatorio):
   - `git log <rama-actual>..origin/<base> --oneline`
   - `git diff <rama-actual>...origin/<base> --stat`
   - comparalo con el alcance de la feature (`git diff origin/<base>...<rama-actual> --stat`).
   - Sin solapamiento de archivos: seguí. Con solapamiento: mostrá los archivos en común y pedí confirmación explícita.
3. Aplicar: `git merge origin/<base>` (nunca `--squash`; nunca rebase si la rama ya está pusheada) o `git cherry-pick <hash...>`. Conflictos triviales (imports, orden, formato) se resuelven; los de lógica ambigua se muestran y se consulta.
4. Verificar: `git status` limpio (sin merge a medias), diff contra la base acotado al dominio de la feature y `pnpm check:types` si se tocó lógica.
5. Reportar commits traídos, archivos tocados y conflictos resueltos. No pushear salvo pedido explícito.
