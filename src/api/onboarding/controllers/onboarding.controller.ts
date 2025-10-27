import { OnboardingService } from '@api/onboarding/services/onboarding.service';
import { UserResponseDto } from '@api/users/dtos/response/user.response.dto';
import { Audit } from '@core/middlewares/decorators/audit.decorator';
import { AuditInterceptor } from '@core/middlewares/interceptors/audit.interceptor';
import {
  Controller,
  Post,
  Version,
  UseInterceptors,
  UnauthorizedException,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiBasicAuth,
} from '@nestjs/swagger';
import { BasicAuthGuard } from '@modules/auth/guards/basic-auth.guard';
import { OnboardingUserRequestDto } from '../dto/request/onboarding-user.request.dto';

@ApiTags('Onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('')
  @Version('1')
  @Audit('users')
  @ApiBasicAuth()
  @UseInterceptors(AuditInterceptor)
  @ApiOperation({
    summary: 'Onboarding de un nuevo usuario',
    description: 'Registrar un nuevo usuario con datos proveidos',
  })
  @ApiCreatedResponse({
    description: 'Usuario creado satisfactoriamente',
    type: UserResponseDto,
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
  @UseGuards(BasicAuthGuard)
  async onboarding(
    @Body() dto: OnboardingUserRequestDto,
  ): Promise<UserResponseDto | undefined> {
    return await this.onboardingService.onboarding(dto);
  }
}
