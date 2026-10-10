describe('registro condicional de los módulos de catálogo', () => {
  const original = process.env.DATABASE_CONNECTION_STRING;

  afterEach(() => {
    if (original === undefined) delete process.env.DATABASE_CONNECTION_STRING;
    else process.env.DATABASE_CONNECTION_STRING = original;
    jest.resetModules();
  });

  const importsOf = (target: unknown): unknown[] =>
    (Reflect.getMetadata('imports', target as object) as unknown[]) ?? [];

  it('sin DATABASE_CONNECTION_STRING no importa los módulos de datos (503 en cada endpoint)', async () => {
    process.env.DATABASE_CONNECTION_STRING = '';
    jest.resetModules();

    const raw = await import('./catalog-raw-api.module');
    const orm = await import('../catalog-orm/catalog-orm-api.module');

    expect(importsOf(raw.CatalogRawApiModule)).toEqual([]);
    expect(importsOf(orm.CatalogOrmApiModule)).toEqual([]);
  });

  it('con DATABASE_CONNECTION_STRING importa el módulo de datos', async () => {
    process.env.DATABASE_CONNECTION_STRING = 'DRIVER={x}';
    jest.resetModules();

    const raw = await import('./catalog-raw-api.module');
    const orm = await import('../catalog-orm/catalog-orm-api.module');

    expect(importsOf(raw.CatalogRawApiModule)).toHaveLength(1);
    expect(importsOf(orm.CatalogOrmApiModule)).toHaveLength(1);
  });
});
