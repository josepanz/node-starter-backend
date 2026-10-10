import { registerUppercaseHooks } from './sequelize-register-uppercase-hooks';

type Hook = (arg: unknown) => void;

const buildModel = () => {
  const hooks: Record<string, Hook> = {};
  return {
    hooks,
    model: {
      addHook: jest.fn((name: string, fn: Hook) => {
        hooks[name] = fn;
      }),
    },
  };
};

const buildInstance = (data: Record<string, unknown>) => ({
  dataValues: data,
  getDataValue: (key: string) => data[key],
  setDataValue: (key: string, value: unknown) => {
    data[key] = value;
  },
});

describe('registerUppercaseHooks', () => {
  it('registra los cuatro hooks por modelo', () => {
    const { model } = buildModel();

    registerUppercaseHooks([model as never]);

    expect(model.addHook.mock.calls.map(([name]) => name)).toEqual([
      'beforeCreate',
      'beforeUpdate',
      'beforeBulkCreate',
      'beforeBulkUpdate',
    ]);
  });

  it('sube a mayúsculas strings de instancias (create) y de bulkCreate', () => {
    const { model, hooks } = buildModel();
    registerUppercaseHooks([model as never]);
    const single = buildInstance({ code: 'ab', qty: 3 });
    const bulkA = buildInstance({ code: 'cd' });
    const bulkB = buildInstance({ code: 'ef' });

    hooks.beforeCreate(single);
    hooks.beforeBulkCreate([bulkA, bulkB]);

    expect(single.dataValues).toEqual({ code: 'AB', qty: 3 });
    expect(bulkA.dataValues.code).toBe('CD');
    expect(bulkB.dataValues.code).toBe('EF');
  });

  it('sube a mayúsculas options.attributes en bulkUpdate y tolera su ausencia', () => {
    const { model, hooks } = buildModel();
    registerUppercaseHooks([model as never]);
    const options = { attributes: { name: 'abc', qty: 1 } };

    hooks.beforeBulkUpdate(options);
    hooks.beforeBulkUpdate({});

    expect(options.attributes).toEqual({ name: 'ABC', qty: 1 });
  });
});
