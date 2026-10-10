/**
 * Patrón: helper de specs de controllers (DRY). Lee los metadatos que dejan `@Permissions` /
 * `@WithPermissions` para verificar que cada endpoint exige el permiso declarado sin levantar Nest.
 */
import 'reflect-metadata';
import { PERMISSIONS_KEY } from '@common/decorators/permissions.decorator';

type Ctor<T> = { prototype: T };

export const permissionsOf = <T>(
  controller: Ctor<T>,
  method: keyof T,
): string[] | undefined =>
  Reflect.getMetadata(
    PERMISSIONS_KEY,
    controller.prototype[method] as unknown as object,
  ) as string[] | undefined;
