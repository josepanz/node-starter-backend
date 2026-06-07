import { Injectable, BadRequestException } from '@nestjs/common';
import { CryptoHelper } from '@common/helpers/crypto-helpers';

import * as DTO from '@api/onboarding/dto';
import { OnboardingService } from '@modules/onboarding/services/onboarding.service';

/**
 * Servicio de API de Onboarding - Capa BFF
 *
 * Responsabilidades:
 * - Validar DTOs
 * - Desencriptar contraseñas
 * - Orquestar llamadas al OnboardingService
 * - Transformar respuestas a DTOs
 */
@Injectable()
export class OnboardingApiService {
  constructor(private readonly onboardingService: OnboardingService) {}

  /**
   * Registra un nuevo usuario (onboarding público)
   */
  async onboarding(
    dto: DTO.OnboardingUserRequestDTO,
  ): Promise<DTO.OnboardingUserResponseDTO> {
    // Desencriptar ambas contraseñas
    const decryptedPassword = CryptoHelper.decrypt(
      dto.password,
      'sha256',
    ).toString('utf-8');

    const decryptedConfirmPassword = CryptoHelper.decrypt(
      dto.confirmPassword,
      'sha256',
    ).toString('utf-8');

    // Validar que las contraseñas coincidan
    if (decryptedPassword !== decryptedConfirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden.');
    }

    // Registrar usuario con la contraseña desencriptada
    const user = await this.onboardingService.registerUser({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      password: decryptedPassword,
      acceptedTerms: dto.acceptTerms,
    });

    // Mapear a DTO de respuesta
    return {
      referenceId: user.referenceId,
      email: user.email,
      status: user.status,
    };
  }
}
