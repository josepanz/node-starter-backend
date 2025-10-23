import { Injectable, Logger } from '@nestjs/common';
import { CreateExampleRequestDto } from '../dtos/requests/create-example.request.dto';
import { CreateExampleResponseDto } from '../dtos/responses/create-example.response.dto';
import { ExampleService } from '@modules/example/example.service';

@Injectable()
export class ExampleApiService {
  private readonly logger = new Logger(ExampleApiService.name);

  constructor(private readonly exampleService: ExampleService) {}

  /**
   * Metodo de creacion de ejemplo
   * @param dto Datos para la creacion de un ejemplo
   * @returns Ejemplo creado
   */
  async createExample(
    dto: CreateExampleRequestDto,
  ): Promise<CreateExampleResponseDto> {
    this.logger.log('Este es un metodo de ejemplo en ExampleService');
    return await this.exampleService.create(dto);
  }

  /**
   * Metodo para obtener todos los ejemplos
   * @returns Listado de ejemplos
   */
  async getAllExample(): Promise<CreateExampleResponseDto[]> {
    this.logger.log('Este es un metodo de ejemplo en ExampleService');
    return await this.exampleService.findAll();
  }
}
