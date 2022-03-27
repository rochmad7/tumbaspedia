import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.rolesRepository.create(createRoleDto);

    return await this.rolesRepository.save(role);
  }

  findAll(): Promise<Role[]> {
    return this.rolesRepository.find();
  }

  async findOne(id: number): Promise<Role> {
    return await this.rolesRepository.findOne(id);
  }

  update(id: number, updateRoleDto: UpdateRoleDto): Promise<UpdateResult> {
    const updateRole = this.rolesRepository.update(id, updateRoleDto);
    if (!updateRole) {
      throw new NotFoundException('Role not found');
    }

    return updateRole;
  }

  remove(id: number): Promise<UpdateResult> {
    const deleteRole = this.rolesRepository.update(id, {
      deleted_at: Date.now(),
    });
    if (!deleteRole) {
      throw new NotFoundException('Role not found');
    }

    return deleteRole;
  }
}
