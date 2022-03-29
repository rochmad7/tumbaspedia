import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Shop } from './entities/shop.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { ConstRole } from '../constants';

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

    const uploadImage = await this.cloudinaryService.uploadImage(file);

    try {
      if (user.role.id !== ConstRole.SELLER) {
        const role = await this.rolesService.findOne(ConstRole.SELLER);

        await this.usersService.changeRole(userId, role);
      }
      // createShopDto.shop_picture = uploadImage.url;
      // createShopDto.is_open = true;
      // createShopDto.is_verified = true;
      // createShopDto.user = user;

      const shop = this.shopsRepository.create({
        ...createShopDto,
        shop_picture: uploadImage.url,
        is_open: true,
        is_verified: true,
        user: user,
      });
      return await this.shopsRepository.save(shop);
    } catch (err) {
      await this.cloudinaryService.deleteImage(uploadImage.public_id);
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async findAll(): Promise<Shop[]> {
    return await this.shopsRepository.find();
  }

  findOne(id: number): Promise<Shop> {
    const shop = this.shopsRepository.findOne(id);
    if (!shop) {
      throw new NotFoundException(`Shop not found`);
    }

    return shop;
  }

  findOneByUserID(id: number): Promise<Shop> {
    const user = this.usersService.findOneById(id);

    const shop = this.shopsRepository.findOne({ where: { user } });
    if (!shop) {
      throw new NotFoundException(`Shop not found`);
    }

    return shop;
  }

  async update(
    id: number,
    updateShopDto: UpdateShopDto,
  ): Promise<UpdateResult> {
    updateShopDto.updated_at = new Date();
    const updateShop = await this.shopsRepository.update(id, updateShopDto);
    if (updateShop.affected === 0) {
      throw new NotFoundException(`Shop not found`);
    }

    return updateShop;
  }

  async remove(id: number): Promise<UpdateResult> {
    const shop = await this.shopsRepository.findOne(id);
    if (!shop) {
      throw new NotFoundException(`Shop not found`);
    }

    const deleteShop = await this.shopsRepository.update(id, {
      deleted_at: new Date(),
    });
    return deleteShop;
  }
}
