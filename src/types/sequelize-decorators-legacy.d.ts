/**
 * Shim de tipos: el proyecto compila con `moduleResolution: node` (CommonJS), que ignora el campo
 * `exports` de `@sequelize/core`, así que el subpath `decorators-legacy` no se resuelve para tipos.
 * En runtime Node/Jest sí lo resuelven por `exports` (condición `require`); esto solo cubre el tipado.
 */
declare module '@sequelize/core/decorators-legacy' {
  export * from '@sequelize/core/lib/decorators/legacy/index';
}
