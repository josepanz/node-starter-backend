import { ConflictException } from '@nestjs/common';
import { Prisma, UserProfileStatus, UserStatus } from '@prisma/client';
import { EmailTypeEnum } from '@modules/email/enum/email-type.enum';
import { OnboardingService } from './onboarding.service';

describe('OnboardingService', () => {
  const users = { create: jest.fn() };
  const passwords = { createOrUpdatePassword: jest.fn() };
  const email = { sendEmailByType: jest.fn() };
  let service: OnboardingService;

  const data = {
    firstName: 'A',
    lastName: 'B',
    email: 'a@b.c',
    phoneNumber: '123',
    password: 'Secret#1',
    acceptedTerms: true,
  };

  beforeEach(() => {
    jest.resetAllMocks();
    service = new OnboardingService(
      users as never,
      passwords as never,
      email as never,
    );
  });

  it('crea usuario pendiente de verificación, credenciales y email', async () => {
    users.create.mockResolvedValue({ id: 4, email: 'a@b.c' });
    const r = await service.registerUser(data);
    expect(r).toEqual({ id: 4, email: 'a@b.c' });
    expect(users.create.mock.calls[0][0]).toMatchObject({
      status: UserStatus.PENDING_VERIFICATION,
      profileStatus: UserProfileStatus.DOCUMENT_PENDING,
      createdBy: 'a@b.c',
      isEmployee: false,
      isLdap: false,
    });
    expect(users.create.mock.calls[0][0].acceptedTermsAt).toBeInstanceOf(Date);
    expect(passwords.createOrUpdatePassword).toHaveBeenCalledWith(
      4,
      'Secret#1',
    );
    expect(email.sendEmailByType).toHaveBeenCalledWith(
      'a@b.c',
      EmailTypeEnum.VERIFICATION,
      r,
    );
  });

  it('acceptedTermsAt es null si no aceptó los términos', async () => {
    users.create.mockResolvedValue({ id: 4 });
    await service.registerUser({ ...data, acceptedTerms: false });
    expect(users.create.mock.calls[0][0].acceptedTermsAt).toBeNull();
  });

  it('traduce violación de unicidad en Conflict y no crea credenciales', async () => {
    users.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('dup', {
        code: 'P2002',
        clientVersion: 'x',
      }),
    );
    await expect(service.registerUser(data)).rejects.toThrow(ConflictException);
    expect(passwords.createOrUpdatePassword).not.toHaveBeenCalled();
  });

  it('relanza otros errores', async () => {
    users.create.mockResolvedValue({ id: 4 });
    passwords.createOrUpdatePassword.mockRejectedValue(new Error('policy'));
    await expect(service.registerUser(data)).rejects.toThrow('policy');
    expect(email.sendEmailByType).not.toHaveBeenCalled();
  });

  it('relanza errores de Prisma con otro código', async () => {
    users.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('x', {
        code: 'P2025',
        clientVersion: 'x',
      }),
    );
    await expect(service.registerUser(data)).rejects.toThrow(
      Prisma.PrismaClientKnownRequestError,
    );
  });
});
