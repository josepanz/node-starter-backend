import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Users } from '@prisma/client';
import { EmailService } from '@modules/email/services/email.service';
import { EmailTypeEnum } from '@modules/email/enum/email-type.enum';

@Injectable()
export class EmailApiService {
  private readonly logger = new Logger(EmailApiService.name);

  constructor(private readonly emailService: EmailService) {}

  /**
   * Envía un correo electrónico de verificación de correo.
   * @param to Dirección de correo del destinatario.
   * @param user Usuario,
   * @throws NotFoundException si el usuario no es encontrado o está inactivo.
   * @throws InternalServerErrorException si el tipo de correo no es reconocido.
   * @remarks
   * Este método maneja el envío de correos de verificación de usuario, generando un token temporal y
   * utilizando el servicio de usuarios para obtener la información necesaria.
   * @returns void
   */
  async sendVerificationEmail(to: string, user: Users): Promise<void> {
    if (!user) {
      this.logger.warn(`Usuario con email ${to} no encontrado o inactivo.`);
      throw new NotFoundException('Usuario no encontrado o inactivo.');
    }

    await this.emailService.sendEmailByType(
      to,
      EmailTypeEnum.VERIFICATION,
      user,
    );
  }

  /**
   * Envía un correo electrónico para Olvifr mi contraseña.
   * @param to Dirección de correo del destinatario.
   * @param user Usuario,
   * @throws NotFoundException si el usuario no es encontrado o está inactivo.
   * @throws InternalServerErrorException si el tipo de correo no es reconocido.
   * @remarks
   * Este método maneja el envío de correos para olvido de contraseñas, generando un token temporal y
   * utilizando el servicio de usuarios para obtener la información necesaria.
   * @returns void
   */
  async sendForgotPasswordEmail(to: string, user: Users): Promise<void> {
    if (!user) {
      this.logger.warn(`Usuario con email ${to} no encontrado o inactivo.`);
      throw new NotFoundException('Usuario no encontrado o inactivo.');
    }

    await this.emailService.sendEmailByType(
      to,
      EmailTypeEnum.FORGOT_PASSWORD,
      user,
    );
  }
}
