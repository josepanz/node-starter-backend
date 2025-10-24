import { PrismaBaseService } from '@common/services/base/prisma-base.service';
import { Injectable } from '@nestjs/common';
import { Example } from '@prisma/client';
import { ExampleRepository } from './repository/example.repository';

@Injectable()
export class ExampleService extends PrismaBaseService<Example> {
  constructor(private readonly exampleRepository: ExampleRepository) {
    super(exampleRepository);
  }

  // Ejemplo de método adicional si querés lógica de negocio:
  async findActiveUsers() {
    return this.repository.findMany({ where: { isActive: true } });
  }
}
