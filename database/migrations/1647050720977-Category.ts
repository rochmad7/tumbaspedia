import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { Category } from '../../src/categories/entities/category.entity';
import { DEFAULT_CATEGORY_PICTURE } from '../../src/constants';

export class Category1647050720977 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'categories',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'icon',
            type: 'text',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(Category)
      .values([
        {
          name: 'Kuliner',
          description: 'Temukan produk kuliner terbaik',
          icon: DEFAULT_CATEGORY_PICTURE,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Jasa',
          description: 'Temukan jasa terbaik',
          icon: DEFAULT_CATEGORY_PICTURE,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Herbal',
          description: 'Temukan produk herbal terbaik',
          icon: DEFAULT_CATEGORY_PICTURE,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ])
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('categories');
  }
}
