import Sequelize from '@sequelize/core';
import { PostgresDialect } from '@sequelize/postgres';
import { CategoryEntity } from './category.entity';
import { ItemStockEntity } from './item-stock.entity';
import { ItemEntity } from './item.entity';

/**
 * Inicializa las entities en una instancia Sequelize SIN conectar (el dialecto no importa para
 * verificar el mapeo declarativo): comprueba tabla/schema, @ColumnName, tipos y la asociación.
 */
describe('catalog-orm entities', () => {
  const sequelize = new Sequelize({
    dialect: PostgresDialect,
    models: [CategoryEntity, ItemEntity, ItemStockEntity],
  });

  it('declara tabla, schema y sin timestamps', () => {
    const definition = ItemEntity.modelDefinition;

    expect(definition.table.tableName).toBe('ITEMS');
    expect(definition.table.schema).toBe('APPLIB');
    expect(Object.keys(definition.rawAttributes)).not.toContain('createdAt');
    expect(sequelize.models.has(ItemEntity)).toBe(true);
  });

  it('mapea cada atributo a su columna legacy con @ColumnName', () => {
    const columns = Object.fromEntries(
      [...ItemEntity.modelDefinition.columns.values()].map((column) => [
        column.attributeName,
        column.columnName,
      ]),
    );

    expect(columns).toEqual({
      itemCode: 'ITMCOD',
      description: 'ITMDSC',
      categoryCode: 'ITMCAT',
      statusCode: 'ITMSTS',
      price: 'ITMPRC',
      createdOn: 'ITMFEC',
    });
  });

  it('resuelve la relación BelongsTo con su FK explícita', () => {
    const association = ItemEntity.modelDefinition.associations.category;

    expect(association.target).toBe(CategoryEntity);
    expect(association.associationType).toBe('BelongsTo');
    expect(ItemStockEntity.modelDefinition.associations.item.target).toBe(
      ItemEntity,
    );
  });
});
