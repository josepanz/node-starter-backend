import { PrismaBaseRepository } from '@core/database/prisma-base.repository';
import { PrismaDatasource } from '@core/database/prisma.service';
import { Injectable } from '@nestjs/common';
import { Example } from '@prisma/client';

@Injectable()
export class ExampleRepository extends PrismaBaseRepository<Example> {
  constructor(prisma: PrismaDatasource) {
    super(prisma, prisma.example);
  }

  // Ejemplo de método personalizado si quisieras agregar uno:
  async findByEmail(email: string): Promise<Example | null> {
    return await this.model.findUnique({
      where: { email },
    });
  }
}
