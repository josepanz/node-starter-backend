/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createUser } from './create-user.use-case';
import { UserStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

describe('createUser', () => {
  const mockDatasource: any = {
    users: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  const dto = {
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    documentNumber: '12345678',
    isEmployee: false,
    isLdap: false,
    status: UserStatus.ACTIVE,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Debería crear un usuario cuando el usuario no existe.', async () => {
    mockDatasource.users.findFirst.mockResolvedValue(null);
    mockDatasource.users.create.mockResolvedValue({ id: '123', ...dto });

    const result = await createUser(dto, mockDatasource, 'admin@test.com');

    expect(mockDatasource.users.findFirst).toHaveBeenCalled();
    expect(mockDatasource.users.create).toHaveBeenCalledWith({
      data: {
        ...dto,
        lastLogin: expect.any(Date),
        createdBy: 'admin@test.com',
      },
    });
    expect(result).toHaveProperty('id', '123');
  });

  it('Debería lanzar BadRequestException cuando el usuario ya existe', async () => {
    mockDatasource.users.findFirst.mockResolvedValue({ id: 'existing-user' });

    await expect(createUser(dto, mockDatasource)).rejects.toThrow(
      BadRequestException,
    );
  });
});
