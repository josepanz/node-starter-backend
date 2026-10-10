import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigType } from '@nestjs/config';
import type { Cache } from 'cache-manager';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { CACHE_KEYS } from './cache-ttl.constant';

/**
 * Patrón: cache-aside con invalidación por "época". Cachea el resultado de resolver al usuario
 * (roles + permisos) por referenceId. Cambiar roles/permisos de un usuario o de un rol afecta a
 * un conjunto de usuarios difícil de enumerar, así que `invalidateAll()` incrementa una época
 * compartida (las claves viejas dejan de leerse y expiran por TTL) en vez de borrar claves una
 * a una. TTL 0 (PERMISSIONS_CACHE_TTL_SECONDS) deshabilita todo. Cualquier error del store se
 * trata como miss: el cache nunca puede romper la autenticación.
 */
@Injectable()
export class PermissionsCacheService {
  private readonly logger = new Logger(PermissionsCacheService.name);
  private static readonly EPOCH_TTL_MS = 30 * 24 * 3600 * 1000;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @Inject(APP_CONFIG.KEY) private readonly config: ConfigType<AppConfigType>,
  ) {}

  get enabled(): boolean {
    return this.config.cache.permissionsTtlSeconds > 0;
  }

  /**
   * Cache-aside: devuelve el valor cacheado o ejecuta `loader` y lo guarda. La época se lee
   * ANTES de cargar, así un `invalidateAll()` concurrente deja el resultado (posiblemente viejo)
   * bajo una época que ya nadie lee, en vez de repoblar el cache con datos obsoletos.
   */
  async getOrLoad<T>(userRef: string, loader: () => Promise<T>): Promise<T> {
    if (!this.enabled) return await loader();

    let epoch: string;
    try {
      epoch = await this.currentEpoch();
      const hit = await this.cache.get<T>(
        CACHE_KEYS.permissions(epoch, userRef),
      );
      if (hit !== undefined && hit !== null) return hit;
    } catch (error) {
      this.warn('lectura', error);
      return await loader();
    }

    const value = await loader();
    try {
      await this.cache.set(
        CACHE_KEYS.permissions(epoch, userRef),
        value,
        this.config.cache.permissionsTtlSeconds * 1000,
      );
    } catch (error) {
      this.warn('escritura', error);
    }
    return value;
  }

  /** Invalida los permisos cacheados de TODOS los usuarios (cambio de roles/permisos). */
  async invalidateAll(): Promise<void> {
    if (!this.enabled) return;
    try {
      await this.cache.set(
        CACHE_KEYS.permissionsEpoch,
        `${Date.now()}`,
        PermissionsCacheService.EPOCH_TTL_MS,
      );
    } catch (error) {
      this.warn('invalidación', error);
    }
  }

  private async currentEpoch(): Promise<string> {
    return (await this.cache.get<string>(CACHE_KEYS.permissionsEpoch)) ?? '0';
  }

  private warn(operation: string, error: unknown): void {
    this.logger.warn(
      `Cache de permisos (${operation}) omitido: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
