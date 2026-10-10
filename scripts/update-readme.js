#!/usr/bin/env node
/**
 * Regenera los bloques automáticos del README.md.
 *
 * Patrón: template con marcadores explícitos (`<!-- AUTO:<NOMBRE>:START -->` ...
 * `<!-- AUTO:<NOMBRE>:END -->`). Solo se reescribe lo que está entre marcadores; si un
 * marcador falta se avisa por consola y no se toca nada. Todo lo demás es contenido manual.
 *
 * Fuentes: package.json, docs/documentation.json (compodoc, opcional), .env.template,
 * escaneo de src/api/**\/*.controller.ts y árbol de src/.
 *
 * Uso: node scripts/update-readme.js   (env README_LOCALE, default "es")
 */
const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const readmePath = path.join(rootDir, 'README.md');
const pkgPath = path.join(rootDir, 'package.json');
const compodocPath = path.join(rootDir, 'docs', 'documentation.json');
const envTemplatePath = path.join(rootDir, '.env.template');
const srcDir = path.join(rootDir, 'src');
const apiDir = path.join(srcDir, 'api');
const locale = process.env.README_LOCALE || 'es';

const NO_COMPODOC =
  '> _Sin datos de Compodoc: ejecutar `pnpm docs:json` (o `pnpm docs:update-readme`) y volver a correr el script._';

/** Módulos opcionales: tabla declarativa (nombre, env que lo activa, comportamiento sin ella). */
const OPTIONAL_MODULES = [
  ['PostgreSQL / Prisma', '`DATABASE_URL`', 'Base principal; requerida'],
  ['DB2 / Sequelize', '`DATABASE_CONNECTION_STRING`', 'No se registra el módulo Sequelize'],
  ['Redis (cache, rate limit, nonces, realtime)', '`REDIS_URL`', 'Memoria del proceso'],
  ['MongoDB (activity log)', '`MONGO_URI`', 'Store noop (no persiste)'],
  ['Email SMTP', '`EMAIL_HOST`', 'ConsoleEmailSender (solo loguea)'],
  ['SMS Infobip', '`SMS_PROVIDER=infobip` + `INFOBIP_API_KEY`, `INFOBIP_BASE_URL`', 'Proveedor console'],
  ['Push FCM', '`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`', 'Proveedor Noop'],
  ['Push Web (VAPID)', '`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`', 'Proveedor Noop'],
  ['Storage S3', '`S3_BUCKET_NAME` + credenciales `S3_*`', 'Storage deshabilitado'],
  ['Sentry', '`SENTRY_DSN`', 'No reporta'],
  ['Seq (logs)', '`SEQ_ENABLED=true`', 'Solo logs por stdout'],
  ['Scheduler / cron jobs', '`SCHEDULER_ENABLED` (cada job: `*_CRON`, `off` lo desactiva)', 'Sin tareas programadas'],
  ['Rate limiting', '`RATE_LIMIT_ENABLED`', 'Sin límites'],
  ['Ledger de mensajes con contenido', '`MESSAGE_CONTENT_POLICY=AUDIT` (+ `ENCRYPTION_KEYS`)', 'Política NONE (sin contenido)'],
];

const LAYER_NOTES = {
  api: 'Entrada HTTP: controllers, DTOs, docs, ApiService',
  modules: 'Servicios, repositorios y acceso a datos por dominio',
  common: 'Transversal: decoradores, helpers, enums, interfaces',
  core: 'Config, base de datos, filtros, interceptors, observabilidad',
  i18n: 'Traducciones',
  types: 'Tipos globales',
};

const warn = (msg) => console.warn(`[update-readme] ${msg}`);
const cell = (v) => String(v ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
const table = (headers, rows) =>
  [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((r) => `| ${r.map(cell).join(' | ')} |`),
  ].join('\n');
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const rel = (p) => p.split(path.sep).join('/');

// ---------- Bloques ----------

function lastUpdate() {
  return new Date().toLocaleString(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function dependencies(pkg) {
  const list = (obj) =>
    Object.entries(obj || {}).map(([n, v]) => [`\`${n}\``, `\`${v}\``]);
  const prod = list(pkg.dependencies);
  const dev = list(pkg.devDependencies);
  const out = [];
  out.push(`**Dependencies** (${prod.length})\n`);
  out.push(prod.length ? table(['Paquete', 'Versión'], prod) : '_Sin dependencias._');
  out.push(`\n**DevDependencies** (${dev.length})\n`);
  out.push(dev.length ? table(['Paquete', 'Versión'], dev) : '_Sin devDependencies._');
  return out.join('\n');
}

function scripts(pkg) {
  const rows = Object.entries(pkg.scripts || {}).map(([n, c]) => [`\`${n}\``, `\`${c}\``]);
  return rows.length ? table(['Script', 'Comando'], rows) : '_Sin scripts definidos._';
}

function modules() {
  if (!fs.existsSync(compodocPath)) return NO_COMPODOC;
  let data;
  try {
    data = readJson(compodocPath);
  } catch (err) {
    return `> _No se pudo leer docs/documentation.json: ${err.message}_`;
  }
  const of = (m, type) => {
    const c = (m.children || []).find((x) => x.type === type);
    return (c ? c.elements : m[type] || []).map((x) => x.name).join(', ') || '-';
  };
  const rows = (data.modules || [])
    .filter((m) => m.file && m.file.startsWith('src/'))
    .sort((a, b) => a.file.localeCompare(b.file))
    .map((m) => [`\`${m.name}\``, `\`${rel(m.file)}\``, of(m, 'controllers'), of(m, 'providers')]);
  return rows.length
    ? table(['Módulo', 'Archivo', 'Controllers', 'Providers'], rows)
    : '_Compodoc no reportó módulos._';
}

function walk(dir, filter, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, filter, acc);
    else if (filter(e.name)) acc.push(full);
  }
  return acc.sort();
}

const joinRoute = (...parts) =>
  '/' + parts.map((p) => String(p || '').replace(/^\/+|\/+$/g, '')).filter(Boolean).join('/');

/** Escaneo simple por decoradores: @Controller + @Get/@Post/... + @Version + permisos/guards. */
function endpoints() {
  const files = walk(apiDir, (n) => n.endsWith('.controller.ts'));
  if (!files.length) return '_Sin controllers detectados en `src/api`._';
  const rows = [];
  const verbRe = /@(Get|Post|Put|Patch|Delete)\(\s*(?:['"`]([^'"`]*)['"`])?\s*\)/;
  for (const file of files) {
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    const src = lines.join('\n');
    const ctrlMatch =
      src.match(/@Controller\(\s*['"`]([^'"`]*)['"`]\s*\)/) ||
      src.match(/@Controller\(\s*\{[^}]*path:\s*['"`]([^'"`]*)['"`]/);
    const prefix = ctrlMatch ? ctrlMatch[1] : '';
    const ctrlVer = (src.match(/@Controller\(\s*\{[^}]*version:\s*['"`](\d+)['"`]/) || [])[1];
    const className = (src.match(/export class (\w+)/) || [])[1] || path.basename(file);
    const classIdx = lines.findIndex((l) => /export class /.test(l));
    const classDecos = lines.slice(0, Math.max(classIdx, 0)).join('\n');
    const classPerms = permsOf(classDecos);

    let block = [];
    for (let i = Math.max(classIdx, 0) + 1; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s{2}@/.test(line) || (block.length && /^\s{4,}\S/.test(line) && !/^\s{2}\S/.test(line))) {
        block.push(line);
        continue;
      }
      if (block.length && /^\s{2}(?:async\s+)?\w+\s*\(/.test(line)) {
        const text = block.join('\n');
        const v = text.match(verbRe);
        if (v) {
          const ver = (text.match(/@Version\(\s*['"`](\d+)['"`]/) || [])[1] || ctrlVer;
          const p = joinRoute(ver ? `v${ver}` : '', prefix, v[2] || '');
          const perms = [...new Set([...classPerms, ...permsOf(text)])];
          rows.push([v[1].toUpperCase(), `\`${p}\``, className, perms.join(', ') || '-']);
        }
      }
      block = [];
    }
  }
  rows.sort((a, b) => a[1].localeCompare(b[1]) || a[0].localeCompare(b[0]));
  return table(['Método', 'Ruta', 'Controller', 'Permisos / Guards'], rows);
}

function permsOf(text) {
  const out = [];
  for (const m of text.matchAll(/@(?:WithPermissions|Permissions)\(\s*\[?([^)\]]*)\]?\s*\)/g)) {
    m[1].split(',').map((s) => s.trim().replace(/^PERMISSIONS\./, '')).filter(Boolean).forEach((s) => out.push(s));
  }
  for (const m of text.matchAll(/@(?:Public|Roles|UseGuards)\(([^)]*(?:\([^)]*\))?[^)]*)\)/g)) {
    const name = m[0].startsWith('@UseGuards') ? `guards(${m[1].trim()})` : m[0];
    out.push(name);
  }
  if (/@Public\b/.test(text) && !out.some((o) => o.startsWith('@Public'))) out.push('@Public');
  return out;
}

function optionalModules() {
  return table(
    ['Módulo', 'Se activa con', 'Sin configurar'],
    OPTIONAL_MODULES,
  );
}

/** Variables por sección, leídas de los encabezados `# ---- / # NOMBRE / # ----` de .env.template. */
function env() {
  if (!fs.existsSync(envTemplatePath)) return '> _No se encontró `.env.template`._';
  const lines = fs.readFileSync(envTemplatePath, 'utf8').split(/\r?\n/);
  const isRule = (l) => /^#\s*[-=]{5,}\s*$/.test(l);
  const sections = [];
  let current = null;
  let comments = [];
  let inPem = false;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (inPem) {
      if (/-----END /.test(l)) inPem = false;
      continue;
    }
    if (isRule(l) && lines[i + 1] && /^#/.test(lines[i + 1]) && !isRule(lines[i + 1])) {
      // encabezado: título + notas hasta la siguiente regla
      let j = i + 1;
      const head = [];
      while (j < lines.length && !isRule(lines[j])) head.push(lines[j++].replace(/^#\s?/, '').trim());
      current = { title: head[0], note: head.slice(1).join(' '), vars: [] };
      sections.push(current);
      comments = [];
      i = j;
      continue;
    }
    if (/^#/.test(l)) {
      comments.push(l.replace(/^#\s?/, '').trim());
      continue;
    }
    const m = l.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
    if (m && current) {
      if (/^"-----BEGIN /.test(m[2]) && !/-----END /.test(m[2])) inPem = true;
      current.vars.push([`\`${m[1]}\``, comments.join(' ')]);
    }
    if (m || l.trim() === '') comments = [];
  }
  const out = [];
  for (const s of sections) {
    if (!s.vars.length) continue;
    out.push(`**${s.title}**${s.note ? ` - ${s.note}` : ''}\n`);
    out.push(table(['Variable', 'Descripción'], s.vars));
    out.push('');
  }
  out.push('_Los valores por defecto y placeholders están en `.env.template`; no se listan aquí._');
  return out.join('\n');
}

function structure() {
  const lines = ['```plaintext', 'src/'];
  const entries = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name));
  const top = entries(srcDir);
  top.forEach((e, i) => {
    const last = i === top.length - 1;
    const note = e.isDirectory() && LAYER_NOTES[e.name] ? `  # ${LAYER_NOTES[e.name]}` : '';
    lines.push(`${last ? '└── ' : '├── '}${e.name}${e.isDirectory() ? '/' : ''}${note}`);
    if (e.isDirectory()) {
      const subs = entries(path.join(srcDir, e.name)).filter((s) => s.isDirectory());
      subs.forEach((s, k) => {
        lines.push(`${last ? '    ' : '│   '}${k === subs.length - 1 ? '└── ' : '├── '}${s.name}/`);
      });
    }
  });
  lines.push('```');
  return lines.join('\n');
}

// ---------- Reemplazo seguro entre marcadores ----------

function replaceBlock(text, name, content) {
  const start = `<!-- AUTO:${name}:START -->`;
  const end = `<!-- AUTO:${name}:END -->`;
  const s = text.indexOf(start);
  const e = s === -1 ? -1 : text.indexOf(end, s + start.length);
  if (s === -1 || e === -1) {
    warn(`marcador AUTO:${name} no encontrado en README.md; se omite.`);
    return text;
  }
  return `${text.slice(0, s + start.length)}\n${content}\n${text.slice(e)}`;
}

function main() {
  if (!fs.existsSync(readmePath)) {
    warn('no se encontró README.md');
    process.exitCode = 1;
    return;
  }
  const pkg = readJson(pkgPath);
  const blocks = {
    LAST_UPDATE: lastUpdate,
    DEPENDENCIES: () => dependencies(pkg),
    SCRIPTS: () => scripts(pkg),
    MODULES: modules,
    ENDPOINTS: endpoints,
    OPTIONAL_MODULES: optionalModules,
    ENV: env,
    STRUCTURE: structure,
  };
  let readme = fs.readFileSync(readmePath, 'utf8');
  for (const [name, build] of Object.entries(blocks)) {
    let content;
    try {
      content = build();
    } catch (err) {
      warn(`fallo generando ${name}: ${err.message}; se omite.`);
      continue;
    }
    readme = replaceBlock(readme, name, content);
  }
  fs.writeFileSync(readmePath, readme);
  console.log(`README actualizado (${lastUpdate()})`);
}

main();
