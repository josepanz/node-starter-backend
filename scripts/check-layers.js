#!/usr/bin/env node
/**
 * Chequeo de dependencias entre capas: api -> modules -> core/common.
 * - common/ y core/ no importan de modules/ ni api/.
 * - modules/ no importa de api/.
 * Resuelve alias (@api, @modules) e imports relativos. Las excepciones deliberadas están en
 * ALLOWED y deben estar documentadas en ARCHITECTURE.md y .context/rules/architecture.md.
 */
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', 'src');
const FORBIDDEN = {
  common: ['modules', 'api'],
  core: ['modules', 'api'],
  modules: ['api'],
};
const ALLOWED = new Set([
  // Decoradores compuestos de common que referencian guards de modules.
  'common/decorators/with-permissions.decorator.ts',
  'common/decorators/with-permissions.decorator.spec.ts',
  'common/decorators/requires-active-consent.decorator.ts',
  // Test de cableado de infraestructura: instancia módulos de dominio reales.
  'core/infra-wiring.spec.ts',
]);
const IMPORT_RE = /(?:from|import|require\()\s*['"]([^'"]+)['"]/g;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walk(full);
    return e.name.endsWith('.ts') ? [full] : [];
  });
}

function targetLayer(file, spec) {
  const alias = spec.match(/^@(api|modules|core|common)\//);
  if (alias) return alias[1];
  if (!spec.startsWith('.')) return null;
  const rel = path.relative(SRC, path.resolve(path.dirname(file), spec));
  return rel.split(path.sep)[0];
}

const violations = [];
for (const file of walk(SRC)) {
  const rel = path.relative(SRC, file).split(path.sep).join('/');
  const layer = rel.split('/')[0];
  const forbidden = FORBIDDEN[layer];
  if (!forbidden || ALLOWED.has(rel)) continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const m of text.matchAll(IMPORT_RE)) {
    const target = targetLayer(file, m[1]);
    if (target && forbidden.includes(target)) {
      violations.push(`${rel}: ${layer}/ no puede importar de ${target}/ ('${m[1]}')`);
    }
  }
}

if (violations.length) {
  console.error('Violaciones de capas:\n' + violations.map((v) => '  ' + v).join('\n'));
  process.exit(1);
}
console.log('Capas OK');
