import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { EmailHelper } from '@modules/email/helpers/email.helper';
import { ISendEmailOptions } from '@modules/email/interfaces/email.interface';
import { CryptoHelper } from '@common/helpers/crypto-helpers';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { ConfigType } from '@nestjs/config';
import { UserResponseDTO } from '@api/users/dtos/response/user.response.dto';
import { Users } from '@prisma/client';
import { EmailTypeEnum } from '@modules/email/enum/email-type.enum';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject(APP_CONFIG.KEY)
    private configService: ConfigType<AppConfigType>,
  ) {
    this.initializeTransporter();
  }

  /**
   * Inicializa el transporter de nodemailer con la configuración del servicio de correo.
   * @remarks
   * Esta función configura el transporter utilizando los parámetros definidos en la configuración
   * de la aplicación, como el host, puerto, usuario y contraseña del servidor SMTP.
   * @returns void
   * @throws Error si la configuración del correo es inválida.
   */
  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: this.configService.email.host,
      port: this.configService.email.port,
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.email.user,
        pass: this.configService.email.password,
      },
    });
  }

  /**
   * Función que se encarga del envio de correo.
   * @param ISendEmailOptions Objeto que contiene: to (a quien), subject (asunto), content (contenido del correo).
   * @throws InternalServerErrorException si ocurre un error al enviar el correo.
   * @remarks
   * Este método utiliza nodemailer para enviar un correo electrónico con el contenido enviado
   * @returns void
   */
  async send({ to, subject, content }: ISendEmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: `Soporte <${this.configService.email.dir}>`,
        to: to,
        subject: subject,
        html: content,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Correo enviado a: ${to}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error al enviar el correo a ${to}: ${errorMessage}`);
      throw new InternalServerErrorException(
        'Error al enviar el correo de creación de contraseña.',
      );
    }
  }

  /**
   * Envía un correo electrónico basado en el tipo especificado.
   * @param to Dirección de correo del destinatario.
   * @param emailType Tipo de correo a enviar (por ejemplo, 'VERIFICATION').
   * @param user Usuario.
   * @throws NotFoundException si el usuario no es encontrado o está inactivo.
   * @throws InternalServerErrorException si el tipo de correo no es reconocido.
   * @remarks
   * Este método maneja diferentes tipos de correos electrónicos. Actualmente, soporta
   * el envío de correos de verificación de usuario, generando un token temporal y
   * utilizando el servicio de usuarios para obtener la información necesaria.
   * El correo incluye una plantilla HTML personalizada.
   * @returns void
   */
  async sendEmailByType(
    to: string,
    emailType: EmailTypeEnum,
    user?: Users,
    tokenExpiresOverride?: string,
    extraData?: { dto: Record<string, unknown>; description: string },
  ): Promise<void> {
    if (extraData) {
      this.logger.debug(
        `Datos adicionales para el correo: ${extraData.description} - ${JSON.stringify(extraData.dto)}`,
      );
    }
    switch (emailType) {
      case EmailTypeEnum.VERIFICATION: {
        if (!user) {
          this.logger.warn(`Usuario con email ${to} no encontrado o inactivo.`);
          throw new NotFoundException('Usuario no encontrado o inactivo.');
        }

        const tempToken = CryptoHelper.generateToken(
          'tempToken',
          {
            sub: String(user.id),
            email: user.email,
            user: user as UserResponseDTO,
          },
          'RS256',
          this.configService.authentication.tempTokenExpires,
        );

        const userVerificationLink = `${this.configService.baseUrl}/auth/verify-email/confirm?email=${to}&token=${tempToken}`;
        await this.send({
          to,
          subject: 'Verificación de correo',
          content: EmailHelper.createUserVerificationTemplate(
            user.firstName + ' ' + user.lastName,
            userVerificationLink,
          ),
        });
        break;
      }
      case EmailTypeEnum.FORGOT_PASSWORD: {
        if (!user) {
          this.logger.warn(`Usuario con email ${to} no encontrado o inactivo.`);
          throw new NotFoundException('Usuario no encontrado o inactivo.');
        }

        const tempToken = CryptoHelper.generateToken(
          'tempToken',
          {
            sub: String(user.id),
            email: user.email,
            action: 'forgotPassword',
          },
          'RS256',
          tokenExpiresOverride ??
            this.configService.authentication.tempTokenExpires,
        );

        const forgotPasswordLink = `${this.configService.baseUrl}/auth/reset-password?token=${tempToken}&email=${encodeURIComponent(to)}`;
        await this.send({
          to,
          subject: 'Olvide mi contraseña',
          content: EmailHelper.createUserForgotPasswordTemplate(
            user.firstName + ' ' + user.lastName,
            forgotPasswordLink,
          ),
        });
        break;
      }
      case EmailTypeEnum.CREATE_PASSWORD: {
        if (!user) {
          this.logger.warn(`Usuario con email ${to} no encontrado o inactivo.`);
          throw new NotFoundException('Usuario no encontrado o inactivo.');
        }

        const tempToken = CryptoHelper.generateToken(
          'tempToken',
          {
            sub: String(user.id),
            email: user.email,
          },
          'RS256',
          this.configService.authentication.tempTokenExpires,
        );

        const createPasswordLink = `${this.configService.baseUrl}/auth/set-password?email=${to}&token=${tempToken}`;

        await this.send({
          to,
          subject: 'Creá tu contraseña',
          content: EmailHelper.createPasswordCreationTemplate(
            user.firstName + ' ' + user.lastName,
            createPasswordLink,
          ),
        });
        break;
      }

      default: {
        this.logger.warn(`Tipo de email no reconocido`);
        throw new InternalServerErrorException('Tipo de email no reconocido.');
      }
    }
  }
}
