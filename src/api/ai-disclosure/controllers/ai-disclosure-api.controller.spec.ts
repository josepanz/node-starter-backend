import { PERMISSIONS } from '@common/enum/permissions.enum';
import { permissionsOf } from '../../../../test/helpers/controller-metadata';
import { AiDisclosureApiController } from './ai-disclosure-api.controller';

describe('AiDisclosureApiController', () => {
  const service = {
    mark: jest.fn(),
    find: jest.fn(),
    markReviewed: jest.fn(),
  };
  const row = (reviewedAt: Date | null) => ({
    referenceId: 'ref',
    entityType: 'Order',
    entityId: '1',
    model: 'm',
    generatedAt: new Date('2024-01-01'),
    reviewedBy: reviewedAt ? 3 : null,
    reviewedAt,
    notes: null,
  });
  let controller: AiDisclosureApiController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AiDisclosureApiController(service as never);
  });

  it('mark mapea la entidad a DTO sin revisión', async () => {
    service.mark.mockResolvedValue(row(null));
    const r = await controller.mark({ entityType: 'Order' } as never);
    expect(r).toMatchObject({ id: 'ref', reviewed: false, reviewedAt: null });
  });

  it('find consulta por tipo e id de entidad', async () => {
    service.find.mockResolvedValue(row(null));
    await controller.find('Order', '1');
    expect(service.find).toHaveBeenCalledWith('Order', '1');
  });

  it('review marca revisado por el usuario y refleja reviewed=true', async () => {
    service.markReviewed.mockResolvedValue(row(new Date('2024-02-01')));
    const r = await controller.review('Order', '1', { id: 3 } as never);
    expect(service.markReviewed).toHaveBeenCalledWith('Order', '1', 3);
    expect(r.reviewed).toBe(true);
  });

  it('propaga errores del servicio', async () => {
    service.find.mockRejectedValue(new Error('nf'));
    await expect(controller.find('Order', '9')).rejects.toThrow('nf');
  });

  it.each([
    ['mark', [PERMISSIONS.AI_DISCLOSURE.CREATE]],
    ['find', [PERMISSIONS.AI_DISCLOSURE.READ]],
    ['review', [PERMISSIONS.AI_DISCLOSURE.UPDATE]],
  ] as const)('%s exige permisos', (method, expected) => {
    expect(permissionsOf(AiDisclosureApiController, method)).toEqual(expected);
  });
});
