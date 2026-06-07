import { IMerchantContext } from '@common/interfaces/merchant-context.interface';
import { PrismaDatasource } from '@core/database/services/prisma.service';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class MerchantContextGuard implements CanActivate {
  constructor(private prisma: PrismaDatasource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const userExists = await this.prisma.extended.users.findUnique({
      where: { id: Number(user.id) },
      select: { id: true },
    });

    if (!userExists) {
      throw new ForbiddenException('El usuario no existe.');
    }

    const cookieData = request.cookies['merchant-ctx'];

    if (!cookieData) {
      throw new BadRequestException(
        'Falta la cookie merchant-ctx con el contexto de operación.',
      );
    }

    try {
      const decodedString = Buffer.from(cookieData, 'base64').toString('utf-8');
      const merchantContext: IMerchantContext = JSON.parse(decodedString);

      request.merchantContext = merchantContext;

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new BadRequestException(
        'El formato del contexto en la cookie merchant-ctx es inválido.',
      );
    }
  }
}
