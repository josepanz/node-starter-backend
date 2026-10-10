import { BadRequestException } from '@nestjs/common';
import { CryptoHelper } from '@common/helpers/crypto-helpers';
import { OnboardingApiService } from './onboarding-api.service';
import { OnboardingController } from '../controllers/onboarding.controller';

jest.mock('@common/helpers/crypto-helpers', () => ({
  CryptoHelper: { decrypt: jest.fn() },
}));

const decrypt = (CryptoHelper as unknown as { decrypt: jest.Mock }).decrypt;

describe('OnboardingApiService', () => {
  const onboarding = { registerUser: jest.fn() };
  let service: OnboardingApiService;

  const dto = {
    firstName: 'A',
    lastName: 'B',
    email: 'a@b.c',
    phoneNumber: '1',
    password: 'enc-1',
    confirmPassword: 'enc-2',
    acceptTerms: true,
  } as never;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new OnboardingApiService(onboarding as never);
  });

  it('rechaza contraseñas distintas sin registrar', async () => {
    decrypt
      .mockReturnValueOnce(Buffer.from('a'))
      .mockReturnValueOnce(Buffer.from('b'));
    await expect(service.onboarding(dto)).rejects.toThrow(BadRequestException);
    expect(onboarding.registerUser).not.toHaveBeenCalled();
  });

  it('descifra la contraseña, registra y mapea la respuesta', async () => {
    decrypt.mockReturnValue(Buffer.from('Secret#1'));
    onboarding.registerUser.mockResolvedValue({
      referenceId: 'ref',
      email: 'a@b.c',
      status: 'PENDING_VERIFICATION',
      passwordHash: 'no-debe-filtrarse',
    });
    const r = await service.onboarding(dto);
    expect(onboarding.registerUser).toHaveBeenCalledWith({
      firstName: 'A',
      lastName: 'B',
      email: 'a@b.c',
      phoneNumber: '1',
      password: 'Secret#1',
      acceptedTerms: true,
    });
    expect(r).toEqual({
      referenceId: 'ref',
      email: 'a@b.c',
      status: 'PENDING_VERIFICATION',
    });
  });

  it('propaga el error de descifrado', async () => {
    decrypt.mockImplementation(() => {
      throw new Error('bad cipher');
    });
    await expect(service.onboarding(dto)).rejects.toThrow('bad cipher');
  });

  it('el controller delega en el servicio', async () => {
    const api = {
      onboarding: jest.fn().mockResolvedValue({ referenceId: 'r' }),
    };
    const controller = new OnboardingController(api as never);
    await expect(controller.onboarding(dto)).resolves.toEqual({
      referenceId: 'r',
    });
    expect(api.onboarding).toHaveBeenCalledWith(dto);
  });
});
