import { LegalDocumentType } from '@prisma/client';
import { PERMISSIONS } from '@common/enum/permissions.enum';
import { permissionsOf } from '../../../../test/helpers/controller-metadata';
import { LegalApiController } from './legal-api.controller';

describe('LegalApiController', () => {
  const service = {
    listActive: jest.fn(),
    listVersions: jest.fn(),
    publish: jest.fn(),
    accept: jest.fn(),
    listMine: jest.fn(),
    revoke: jest.fn(),
    listPolicies: jest.fn(),
    upsertPolicy: jest.fn(),
  };
  const user = { id: 7, email: 'a@b.c' } as never;
  let controller: LegalApiController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new LegalApiController(service as never);
  });

  it('listActive devuelve los documentos vigentes', async () => {
    service.listActive.mockResolvedValue([{ id: 1 }]);
    await expect(controller.listActive()).resolves.toEqual([{ id: 1 }]);
  });

  it('listVersions filtra por tipo opcional', async () => {
    await controller.listVersions(LegalDocumentType.PRIVACY);
    await controller.listVersions();
    expect(service.listVersions).toHaveBeenNthCalledWith(
      1,
      LegalDocumentType.PRIVACY,
    );
    expect(service.listVersions).toHaveBeenNthCalledWith(2, undefined);
  });

  it('publish pasa el email del autor', async () => {
    const dto = { type: 'PRIVACY' };
    await controller.publish(dto as never, user);
    expect(service.publish).toHaveBeenCalledWith(dto, 'a@b.c');
  });

  it('accept usa el id de usuario, la versión y el contexto del llamador', async () => {
    const caller = { ip: '1.1.1.1' };
    await controller.accept(
      { documentVersionId: 5 } as never,
      user,
      caller as never,
    );
    expect(service.accept).toHaveBeenCalledWith(7, 5, caller);
  });

  it('listMine delega con el id de usuario', async () => {
    await controller.listMine(user);
    expect(service.listMine).toHaveBeenCalledWith(7);
  });

  it('demoProtected responde ok', () => {
    expect(controller.demoProtected()).toEqual({ ok: true });
  });

  it('revoke no devuelve contenido', async () => {
    await expect(
      controller.revoke(LegalDocumentType.PRIVACY, user),
    ).resolves.toBeUndefined();
    expect(service.revoke).toHaveBeenCalledWith(7, LegalDocumentType.PRIVACY);
  });

  it('listPolicies y upsertPolicy delegan', async () => {
    const dto = { dataType: 'x' };
    await controller.listPolicies();
    await controller.upsertPolicy(dto as never, user);
    expect(service.listPolicies).toHaveBeenCalled();
    expect(service.upsertPolicy).toHaveBeenCalledWith(dto, 'a@b.c');
  });

  it('propaga errores del servicio', async () => {
    service.accept.mockRejectedValue(new Error('x'));
    await expect(
      controller.accept({ documentVersionId: 1 } as never, user, {} as never),
    ).rejects.toThrow('x');
  });

  it.each([
    ['listVersions', [PERMISSIONS.LEGAL.READ]],
    ['publish', [PERMISSIONS.LEGAL.CREATE]],
    ['listPolicies', [PERMISSIONS.LEGAL.READ]],
    ['upsertPolicy', [PERMISSIONS.LEGAL.UPDATE]],
  ] as const)('%s exige permisos', (method, expected) => {
    expect(permissionsOf(LegalApiController, method)).toEqual(expected);
  });
});
