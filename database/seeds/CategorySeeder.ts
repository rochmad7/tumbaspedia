import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { Category } from '../../src/categories/entities/category.entity';

export default class CreateUsers implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(Category)
      .values([
        {
          name: 'Kuliner',
          description: 'Temukan produk kuliner terbaik',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Jasa',
          description: 'Temukan jasa terbaik',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Herbal',
          description: 'Temukan produk herbal terbaik',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
      .execute();
  }
}
