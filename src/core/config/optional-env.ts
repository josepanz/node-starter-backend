import { configOptions } from './config-options';

/**
 * Patrón: chequeo de opcionalidad por configuración (DRY para Mongo, Sequelize, etc.).
 * Los decoradores @Module se evalúan al IMPORTAR los archivos, antes de que `ConfigModule.forRoot`
 * cargue el `.env`; por eso, si la variable no está definida, se carga el archivo acá (sin pisar
 * variables ya presentes, igual que ConfigModule). Definirla (aun vacía) evita leer el archivo.
 */
export function isOptionalEnvSet(name: string): boolean {
  if (process.env[name] === undefined) {
    try {
      process.loadEnvFile(configOptions.envFilePath as string);
    } catch {
      // Sin .env (CI, contenedor): se usa solo el entorno del proceso.
    }
  }
  return (process.env[name] ?? '').trim() !== '';
}
