import {
  Controller,
  Post,
  Body,
  Version,
  UnauthorizedException,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ExampleApiService } from '../services/example-api.service';
import { CreateExampleRequestDto } from '../dtos/requests/create-example.request.dto';
import { CreateExampleResponseDto } from '../dtos/responses/create-example.response.dto';

@ApiTags('example')
@ApiBearerAuth()
@Controller('example')
export class ExampleApiController {
  constructor(private readonly exampleApiService: ExampleApiService) {}

  @Post()
  @Version('1')
  @ApiOperation({
    summary: 'Crear un nuevo ejemplo',
    description: 'Registrar un nuevo ejemplo con datos proveidos',
  })
  @ApiCreatedResponse({
    description: 'Ejemplo creado satisfactoriamente',
    type: CreateExampleResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Solicitud mal formada, verifique los datos y/o parametros enviados.',
    example: {
      statusCode: 400,
      message:
        'Solicitud mal formada, verifique los datos y/o parametros enviados.',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciales inválidas.',
    type: UnauthorizedException,
    example: {
      statusCode: 401,
      message: 'Credenciales inválidas.',
    },
  })
  @ApiForbiddenResponse({
    description: 'Usuario bloqueado.',
    example: {
      statusCode: 403,
      message: 'Usuario bloqueado.',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor al procesar la solicitud.',
    example: {
      statusCode: 500,
      message: 'Error interno del servidor al procesar la solicitud.',
    },
  })
  async createExample(
    @Body() dto: CreateExampleRequestDto,
  ): Promise<CreateExampleResponseDto> {
    return await this.exampleApiService.createExample(dto);
  }

  @Get()
  @Version('1')
  @ApiOperation({
    summary: 'Crear un nuevo ejemplo',
    description: 'Registrar un nuevo ejemplo con datos proveidos',
  })
  @ApiCreatedResponse({
    description: 'Ejemplo creado satisfactoriamente',
    type: CreateExampleResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Solicitud mal formada, verifique los datos y/o parametros enviados.',
    example: {
      statusCode: 400,
      message:
        'Solicitud mal formada, verifique los datos y/o parametros enviados.',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciales inválidas.',
    type: UnauthorizedException,
    example: {
      statusCode: 401,
      message: 'Credenciales inválidas.',
    },
  })
  @ApiForbiddenResponse({
    description: 'Usuario bloqueado.',
    example: {
      statusCode: 403,
      message: 'Usuario bloqueado.',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor al procesar la solicitud.',
    example: {
      statusCode: 500,
      message: 'Error interno del servidor al procesar la solicitud.',
    },
  })
  async getAllExample(): Promise<CreateExampleResponseDto[]> {
    return await this.exampleApiService.getAllExample();
  }
}
