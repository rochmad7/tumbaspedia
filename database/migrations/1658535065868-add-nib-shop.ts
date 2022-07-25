import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableUnique,
} from 'typeorm';

export class addNibShop1658535065868 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'shops',
      new TableColumn({
        name: 'nib',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
