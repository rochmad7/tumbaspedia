import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.rolesRepository.create(createRoleDto);

    return await this.rolesRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return await this.rolesRepository.find();
  }

  async findOne(id: number): Promise<Role> {
    return await this.rolesRepository.findOne({ where: { id } });
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<void> {
    const updateRole = await this.rolesRepository.update(id, updateRoleDto);
    if (!updateRole) {
      throw new NotFoundException('Role not found');
    }
  }

  async remove(id: number): Promise<void> {
    const deleteRole = await this.rolesRepository.softDelete(id);
    if (!deleteRole) {
      throw new NotFoundException('Role not found');
    }
  }
}
