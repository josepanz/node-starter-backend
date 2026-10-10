import { PERMISSIONS } from '@common/enum/permissions.enum';
import { permissionsOf } from '../../../../test/helpers/controller-metadata';
import { AuditLogsApiController } from './audit-logs-api.controller';

describe('AuditLogsApiController', () => {
  const service = {
    list: jest.fn(),
    recentAccess: jest.fn(),
    buildExport: jest.fn(),
    findOne: jest.fn(),
  };
  let controller: AuditLogsApiController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuditLogsApiController(service as never);
  });

  it('list delega la query', async () => {
    await controller.list({ page: 1 } as never);
    expect(service.list).toHaveBeenCalledWith({ page: 1 });
  });

  it('recentAccess usa el usuario y el límite', async () => {
    await controller.recentAccess({ id: 4 } as never, { limit: 5 } as never);
    expect(service.recentAccess).toHaveBeenCalledWith(4, 5);
  });

  it('export devuelve el documento de streaming', () => {
    const doc = { items: [] };
    service.buildExport.mockReturnValue(doc);
    expect(controller.export({} as never)).toBe(doc);
  });

  it('findOne convierte el id a BigInt', async () => {
    await controller.findOne(12);
    expect(service.findOne).toHaveBeenCalledWith(12n);
  });

  it('propaga errores del servicio', async () => {
    service.findOne.mockRejectedValue(new Error('nf'));
    await expect(controller.findOne(1)).rejects.toThrow('nf');
  });

  it.each(['list', 'export', 'findOne'] as const)(
    '%s exige AUDIT_LOG.READ',
    (method) => {
      expect(permissionsOf(AuditLogsApiController, method)).toEqual([
        PERMISSIONS.AUDIT_LOG.READ,
      ]);
    },
  );

  it('recentAccess no exige permisos adicionales (solo sesión)', () => {
    expect(
      permissionsOf(AuditLogsApiController, 'recentAccess'),
    ).toBeUndefined();
  });
});
