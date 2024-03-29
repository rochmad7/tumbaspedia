import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class addOldCategoryId1685229690263 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('products', [
      new TableColumn({
        name: 'old_category_id',
        type: 'int',
        isNullable: true,
      }),
      new TableColumn({
        name: 'promoted_at',
        type: 'timestamp',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('products', 'old_category_id');
  }
}
