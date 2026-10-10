import { Model } from '@sequelize/core';
import fg from 'fast-glob';
import { DatabaseHelper } from './database.helper';

jest.mock('fast-glob');

class AlphaModel extends Model {}
class BetaModel extends Model {}

jest.mock('/virtual/alpha.entity.js', () => ({ AlphaModel, helperConst: 1 }), {
  virtual: true,
});
jest.mock('/virtual/beta.entity.js', () => ({ default: BetaModel }), {
  virtual: true,
});
jest.mock('/virtual/empty.entity.js', () => ({ notAModel: () => 1 }), {
  virtual: true,
});
jest.mock(
  '/virtual/broken.entity.js',
  () => {
    throw new Error('syntax');
  },
  { virtual: true },
);

const mockGlob = fg as unknown as jest.Mock;

describe('DatabaseHelper.loadModels', () => {
  beforeEach(() => jest.clearAllMocks());

  it('carga toda clase exportada que extienda Model, sin duplicados', async () => {
    mockGlob.mockResolvedValue([
      '/virtual/beta.entity.js',
      '/virtual/alpha.entity.js',
      '/virtual/alpha.entity.js',
    ]);

    const models = await new DatabaseHelper().loadModels('/virtual');

    expect(models).toEqual([AlphaModel, BetaModel]);
  });

  it('ignora archivos sin modelos o que no cargan, sin tumbar el resto', async () => {
    mockGlob.mockResolvedValue([
      '/virtual/alpha.entity.js',
      '/virtual/empty.entity.js',
      '/virtual/broken.entity.js',
    ]);

    const models = await new DatabaseHelper().loadModels('/virtual');

    expect(models).toEqual([AlphaModel]);
  });

  it('busca entities .js y .ts excluyendo declaraciones', async () => {
    mockGlob.mockResolvedValue([]);

    await new DatabaseHelper().loadModels('/virtual');

    expect(mockGlob).toHaveBeenCalledWith(
      expect.arrayContaining(['**/*.entity.{js,ts}', '!**/*.d.ts']),
      expect.objectContaining({ cwd: '/virtual', absolute: true }),
    );
  });
});
