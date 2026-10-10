import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

const mockFindUser = jest.fn();
const mockGetOrLoad = jest.fn();

const config = { authentication: { publicKey: 'test-public-key' } } as never;

const user = {
  id: 1,
  referenceId: 'ref-1',
  email: 'u@test.com',
  firstName: 'U',
  lastName: 'T',
  currentAccessLevel: null,
  status: 'ACTIVE',
  profileStatus: 'COMPLETE',
  permissions: [{ permission: { name: 'order:read' } }],
  roles: [
    {
      role: {
        name: 'USER',
        rolePermissions: [
          { permission: { name: 'order:read' } },
          { permission: { name: 'order:create' } },
        ],
      },
    },
  ],
};

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  const payload = { sub: 'ref-1', email: 'u@test.com' } as never;

  beforeEach(() => {
    mockGetOrLoad.mockImplementation((_key: string, loader: () => unknown) =>
      loader(),
    );
    strategy = new JwtStrategy(
      { findActiveUserByEmailWithPermissions: mockFindUser } as never,
      { getOrLoad: mockGetOrLoad } as never,
      config,
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('resuelve la identidad a través del cache keyed por sub (referenceId)', async () => {
    mockFindUser.mockResolvedValue(user);

    await strategy.validate(payload);

    expect(mockGetOrLoad).toHaveBeenCalledWith('ref-1', expect.any(Function));
  });

  it('deduplica permisos directos y de rol y lista los roles', async () => {
    mockFindUser.mockResolvedValue(user);

    const result = await strategy.validate(payload);

    expect(result.permissions.sort()).toEqual(['order:create', 'order:read']);
    expect(result.roles).toEqual(['USER']);
  });

  it('un hit del cache evita consultar la base', async () => {
    mockGetOrLoad.mockResolvedValue({ id: 1, permissions: ['cached'] });

    const result = await strategy.validate(payload);

    expect(result.permissions).toEqual(['cached']);
    expect(mockFindUser).not.toHaveBeenCalled();
  });

  it('lanza 401 si el usuario no existe o está inactivo', async () => {
    mockFindUser.mockResolvedValue(null);

    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
