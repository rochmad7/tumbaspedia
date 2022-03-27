import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { Role } from '../../src/roles/entities/role.entity';

export class Role1647094704208 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'roles',
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
            length: '50',
          },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
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
      .into(Role)
      .values([
        {
          name: 'admin',
          description: 'Administrator web',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'seller',
          description: 'Penjual UMKM',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'buyer',
          description: 'Pembeli UMKM',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ])
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('roles');
  }
}
