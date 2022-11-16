import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class addNibNumber1665964083493 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'shops',
      new TableColumn({
        name: 'nib_number',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('shops', 'nib_number');
  }
}
