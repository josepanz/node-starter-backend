import { UsersService } from '@modules/users/users.service';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Users } from '@prisma/client';

@Injectable()
export class UserByEmailLoaderGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const body = request.body;
    const query = request.query;

    if (!body?.email && !query?.email) {
      throw new BadRequestException(
        'La solicitud debe contener un campo "email" en el cuerpo o en los parametros.',
      );
    }

    const email: string = body?.email ?? query?.email;

    const fullUser: Users | null =
      await this.usersService.findActiveUserByEmail(email);

    if (!fullUser) {
      throw new NotFoundException(
        'Usuario no encontrado o inactivo para el email proporcionado.',
      );
    }

    request.user = fullUser;

    return true;
  }
}
