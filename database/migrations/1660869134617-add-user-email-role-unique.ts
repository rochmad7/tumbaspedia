import { MigrationInterface, QueryRunner, TableUnique } from 'typeorm';

export class addUserEmailRoleUnique1660869134617 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users DROP CONSTRAINT UQ_97672ac88f789774dd47f7c8be3`);

    await queryRunner.query(`ALTER TABLE users ADD CONSTRAINT UQ_97672ac88f789774dd47f7c8be3 UNIQUE (email, role)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users DROP CONSTRAINT UQ_97672ac88f789774dd47f7c8be3`);

    await queryRunner.query(`ALTER TABLE users ADD CONSTRAINT UQ_97672ac88f789774dd47f7c8be3 UNIQUE (email)`);
  }
}
