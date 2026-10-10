import { PERMISSIONS } from '@common/enum/permissions.enum';
import { permissionsOf } from '../../../../test/helpers/controller-metadata';
import { JobsApiController } from './jobs-api.controller';

describe('JobsApiController', () => {
  const service = {
    listTypes: jest.fn(),
    enqueue: jest.fn(),
    findOne: jest.fn(),
    requeue: jest.fn(),
  };
  let controller: JobsApiController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new JobsApiController(service as never);
  });

  it('listTypes devuelve los tipos registrados', () => {
    service.listTypes.mockReturnValue({ types: ['a'] });
    expect(controller.listTypes()).toEqual({ types: ['a'] });
  });

  it('enqueue pasa el id del usuario', async () => {
    const dto = { type: 'a' };
    await controller.enqueue(dto as never, { id: 5 } as never);
    expect(service.enqueue).toHaveBeenCalledWith(dto, 5);
  });

  it('findOne y requeue delegan por referenceId', async () => {
    await controller.findOne('ref');
    await controller.requeue('ref');
    expect(service.findOne).toHaveBeenCalledWith('ref');
    expect(service.requeue).toHaveBeenCalledWith('ref');
  });

  it('propaga errores del servicio', async () => {
    service.requeue.mockRejectedValue(new Error('estado'));
    await expect(controller.requeue('r')).rejects.toThrow('estado');
  });

  it.each([
    ['listTypes', [PERMISSIONS.JOB.READ]],
    ['enqueue', [PERMISSIONS.JOB.CREATE]],
    ['findOne', [PERMISSIONS.JOB.READ]],
    ['requeue', [PERMISSIONS.JOB.REQUEUE]],
  ] as const)('%s exige permisos', (method, expected) => {
    expect(permissionsOf(JobsApiController, method)).toEqual(expected);
  });
});
