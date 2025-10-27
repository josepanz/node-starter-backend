import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Version,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiBasicAuth,
} from '@nestjs/swagger';
import { EmailApiService } from '../services/email-api.service';
import { UserByEmailLoaderGuard } from '@modules/auth/guards/user-by-email-loader.guard';
import { User } from '@common/decorators/user.decorator';
import { Users } from '@prisma/client';
import { EmailSendRequestDto } from '@api/email/dto/email-send.request.dto';
import { BasicAuthGuard } from '@modules/auth/guards/basic-auth.guard';

@ApiTags('Email')
@Controller('email')
export class EmailApiController {
  constructor(private readonly emailApiService: EmailApiService) {}

  @Post('send-user-verification')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar email de verificación',
  })
  @ApiResponse({
    status: 200,
    description: 'Email de verificación enviado correctamente.',
  })
  @ApiBody({
    description: 'Email al cual enviar la verificacion',
    type: EmailSendRequestDto,
  })
  @ApiBasicAuth()
  @UseGuards(BasicAuthGuard, UserByEmailLoaderGuard)
  @ApiBadRequestResponse({ description: 'Solicitud inválida.' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  async sendUserVerificationEmail(
    @Body() dto: EmailSendRequestDto,
    @User() user: Users,
  ): Promise<{ message: string }> {
    await this.emailApiService.sendVerificationEmail(dto.email, user);
    return { message: 'Email de verificación enviado correctamente.' };
  }

  @Post('send-forgot-password')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar email para olvido de contraseña',
  })
  @ApiResponse({
    status: 200,
    description: 'Email de olvido de contraseña enviado correctamente.',
  })
  @ApiBody({
    description: 'Email al cual enviar el correo.',
    type: EmailSendRequestDto,
  })
  @ApiBasicAuth()
  @UseGuards(BasicAuthGuard, UserByEmailLoaderGuard)
  @ApiBadRequestResponse({ description: 'Solicitud inválida.' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  async sendForgotPasswordEmail(
    @Body() dto: EmailSendRequestDto,
    @User() user: Users,
  ): Promise<{ message: string }> {
    await this.emailApiService.sendForgotPasswordEmail(dto.email, user);
    return {
      message: 'Email para recuperación de cuenta enviado correctamente.',
    };
  }
}
