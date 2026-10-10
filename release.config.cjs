/**
 * Config de semantic-release (ramas: main y master estables y equivalentes; qa y develop prerelease).
 *
 * Patron: seleccion de plugin por entorno. El analisis de commits, changelog y commit de release son
 * comunes; solo cambia el plugin que publica el release segun la plataforma de CI (GITHUB_ACTIONS /
 * GITLAB_CI). Fuera de CI (p. ej. `pnpm release:dry`) se usa GitHub por defecto.
 *
 * `safeCommitTransform` es un colchon de seguridad para `release-notes-generator`: si un campo del
 * commit llega corrupto (fecha invalida), no se rompe el release. La causa raiz (git-log-parser
 * separa campos con literales de texto legible que pueden aparecer en un mensaje de commit) se cierra
 * con patches/git-log-parser@1.2.1.patch (pnpm.patchedDependencies). Ver .context/rules/infra.md.
 */

const { execSync } = require('node:child_process');

const isGitLab = Boolean(process.env.GITLAB_CI) && !process.env.GITHUB_ACTIONS;
const platformPlugin = isGitLab ? '@semantic-release/gitlab' : '@semantic-release/github';

/** Devuelve la primera fecha valida entre los candidatos, o null. */
function safeDate(...candidates) {
  for (const candidate of candidates) {
    if (!candidate) continue;
    const date = candidate instanceof Date ? candidate : new Date(candidate);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return null;
}

/** Transform de respaldo: acorta hash/header y tolera committerDate invalido. */
function safeCommitTransform(commit, _context, options) {
  const HASH_SHORT_LENGTH = 7;
  const HEADER_MAX_LENGTH = 100;
  const { hash, header, committerDate } = commit;

  const resolvedDate = safeDate(
    committerDate,
    commit.committer && commit.committer.date,
    commit.author && commit.author.date,
  );

  if (committerDate && !safeDate(committerDate)) {
    // eslint-disable-next-line no-console
    console.warn(
      `[release-notes] commit ${hash}: committerDate no parseable. Con el patch de git-log-parser no ` +
        'deberia pasar: revisar si sigue aplicando (pnpm.patchedDependencies) o si hay una colision nueva.',
    );
  }

  return {
    hash: typeof hash === 'string' ? hash.substring(0, HASH_SHORT_LENGTH) : hash,
    header: typeof header === 'string' ? header.substring(0, HEADER_MAX_LENGTH) : header,
    committerDate: resolvedDate ? options.formatDate(resolvedDate) : null,
  };
}

/**
 * semantic-release exige que las ramas de release existan; main y master son equivalentes como produccion.
 * Se filtran las ramas candidatas por las que existen (local o en origin) y se conserva siempre la rama del job de
 * CI. Basta con tener una de las dos. Si git no responde, se usa la lista completa.
 */
function resolveBranches() {
  const candidates = [
    'main',
    'master',
    { name: 'qa', prerelease: true },
    { name: 'develop', prerelease: true },
  ];
  let existing;
  try {
    const out = execSync('git branch --all --format="%(refname:short)"', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const names = out.split(String.fromCharCode(10)).map((line) => line.trim());
    existing = new Set(names.map((name) => (name.startsWith('origin/') ? name.slice('origin/'.length) : name)));
  } catch {
    return candidates;
  }
  const current = process.env.GITHUB_REF_NAME || process.env.CI_COMMIT_BRANCH;
  if (current) existing.add(current);
  const filtered = candidates.filter((branch) => existing.has(typeof branch === 'string' ? branch : branch.name));
  return filtered.length > 0 ? filtered : candidates;
}

const noteKeywords = ['BREAKING CHANGE', 'BREAKING CHANGES', 'BC'];

/** Archivos que el release commitea de vuelta (versionado de imagen por overlay de Kustomize). */
const releaseAssets = [
  'CHANGELOG.md',
  'package.json',
  'pnpm-lock.yaml',
  'ci/k8s/overlays/develop/kustomization.yaml',
  'ci/k8s/overlays/qa/kustomization.yaml',
  'ci/k8s/overlays/production/kustomization.yaml',
];

/** En GitLab la imagen se construye y publica aqui; en GitHub lo hace release.yml. */
const execOptions = {
  prepareCmd: './scripts/replace-version.sh ${nextRelease.version} ${branch.name}',
  ...(isGitLab && {
    publishCmd: './scripts/deploy.sh ${nextRelease.version} ${branch.name}',
  }),
};

module.exports = {
  branches: resolveBranches(),
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        releaseRules: [
          { breaking: true, release: 'major' },
          { type: 'feat', release: 'minor' },
          { type: 'refactor', release: 'minor' },
          { type: 'fix', release: 'patch' },
          { type: 'perf', release: 'patch' },
          { type: 'docs', release: 'patch' },
          { type: 'ci', release: 'patch' },
        ],
        parserOpts: { noteKeywords },
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        parserOpts: { noteKeywords },
        writerOpts: {
          groupBy: 'type',
          commitGroupsSort: ['feat', 'fix', 'perf', 'refactor', 'docs', 'ci'],
          commitsSort: ['scope', 'subject'],
          transform: safeCommitTransform,
        },
        presetConfig: {
          types: [
            { type: 'feat', section: 'Features' },
            { type: 'fix', section: 'Bug Fixes' },
            { type: 'perf', section: 'Performance' },
            { type: 'refactor', section: 'Refactoring' },
            { type: 'docs', section: 'Documentation' },
            { type: 'ci', section: 'CI/CD' },
            { type: 'chore', hidden: true },
            { type: 'test', hidden: true },
            { type: 'style', hidden: true },
          ],
        },
      },
    ],
    '@semantic-release/changelog',
    ['@semantic-release/npm', { npmPublish: false }],
    ['@semantic-release/exec', execOptions],
    [
      '@semantic-release/git',
      {
        assets: releaseAssets,
        message: 'chore(release): ${nextRelease.version} [skip ci]',
      },
    ],
    platformPlugin,
  ],
};
