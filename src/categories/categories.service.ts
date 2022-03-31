import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name, description } = createCategoryDto;
    const category = this.categoriesRepository.create({
      name,
      description,
    });
    await this.categoriesRepository.save(category);

    return category;
  }

  async findAll(): Promise<Category[]> {
    return await this.categoriesRepository.find();
  }

  async findOne(id: number): Promise<Category> {
    const category = this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<void> {
    const updateCategory = await this.categoriesRepository.update(
      id,
      updateCategoryDto,
    );
    if (updateCategory.affected === 0) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }
  }

  async remove(id: number): Promise<void> {
    const deleteCategory = await this.categoriesRepository.softDelete(id);
    if (deleteCategory.affected === 0) {
      throw new NotFoundException(`Category not found`);
    }
  }
}
