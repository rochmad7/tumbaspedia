import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Shop } from './entities/shop.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { CLOUDINARY_FOLDER_SHOP, ConstRole } from '../constants';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopsRepository: Repository<Shop>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
  ) {}

  async create(
    userId: number,
    createShopDto: CreateShopDto,
    file: Express.Multer.File,
  ): Promise<Shop> {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const uploadImage = await this.cloudinaryService.uploadImage(
      file,
      CLOUDINARY_FOLDER_SHOP,
    );

    try {
      if (user.role.id == ConstRole.BUYER) {
        const role = await this.rolesService.findOne(ConstRole.SELLER);

        await this.usersService.changeRole(userId, role);
      }

      const shop = await this.shopsRepository.create({
        ...createShopDto,
        shop_picture: uploadImage.url,
        is_open: true,
        is_verified: true,
        user: user,
      });

      return await this.shopsRepository.save(shop);
    } catch (err) {
      await this.cloudinaryService.deleteImage(uploadImage.public_id);
      throw new Error(err);
    }
  }

  async findAll(search: string): Promise<Shop[]> {
    if (search) {
      return await this.shopsRepository.find({
        where: {
          name: Like(`%${search}%`),
        },
      });
    }

    return await this.shopsRepository.find();
  }

  async findOne(id: number): Promise<Shop> {
    const shop = await this.shopsRepository.findOne({ where: { id } });
    if (!shop) {
      throw new NotFoundException(`Shop not found`);
    }

    return shop;
  }

  async findOneByUserID(id: number): Promise<Shop> {
    const user = await this.usersService.findOneById(id);

    const shop = this.shopsRepository.findOne({ where: { user } });
    if (!shop) {
      throw new NotFoundException(`Shop not found`);
    }

    return shop;
  }

  async update(
    id: number,
    updateShopDto: UpdateShopDto,
    file: Express.Multer.File,
  ): Promise<void> {
    const uploadImage = await this.cloudinaryService.uploadImage(
      file,
      CLOUDINARY_FOLDER_SHOP,
    );

    const updateShop = await this.shopsRepository.update(id, {
      ...updateShopDto,
      shop_picture: uploadImage.secure_url,
    });
    if (updateShop.affected === 0) {
      throw new NotFoundException(`Shop not found`);
    }
  }

  async remove(id: number): Promise<void> {
    const deleteShop = await this.shopsRepository.softDelete(id);
    if (deleteShop.affected === 0) {
      throw new NotFoundException(`Shop not found`);
    }
  }
}
