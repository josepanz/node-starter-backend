import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Users } from '@prisma/client';

/**
 * Decorador personalizado para acceder al usuario autenticado.
 * * Se utiliza para obtener el objeto de usuario completo del request,
 * o una propiedad específica de este.
 *
 * Ejemplo de uso:
 * - Para obtener el objeto completo: `@User() user: UserEntity`
 * - Para obtener una propiedad (ej. email): `@User('email') userEmail: string`
 */
export const User = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): unknown => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as Users;

    // Si se especifica una propiedad (ej. 'email'), se retorna esa propiedad.
    if (user && data) {
      return user[data] ? (user[data] as string) : user;
    }

    // Si no se especifica ninguna, se retorna el objeto completo.
    return user;
  },
);
