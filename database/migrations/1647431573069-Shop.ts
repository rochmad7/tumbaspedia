import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class Shop1647431573069 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'shops',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'owner_id',
            type: 'int',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'shop_picture',
            type: 'varchar',
          },
          {
            name: 'is_open',
            type: 'boolean',
          },
          {
            name: 'is_verified',
            type: 'boolean',
          },
          {
            name: 'opened_at',
            type: 'time',
            default: `'07:00:00'`,
          },
          {
            name: 'closed_at',
            type: 'time',
            default: `'17:00:00'`,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'current_timestamp',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'current_timestamp',
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

    await queryRunner.createForeignKey(
      'shops',
      new TableForeignKey({
        columnNames: ['owner_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('shops');
  }
}
