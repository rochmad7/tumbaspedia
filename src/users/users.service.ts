import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Between, Repository, UpdateResult } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Role } from '../roles/entities/role.entity';
import {
  CLOUDINARY_FOLDER_USER,
  ConstRole,
  DEFAULT_PROFILE_PICTURE,
} from '../constants';
import { RolesService } from '../roles/roles.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private cloudinaryService: CloudinaryService,
    private readonly rolesService: RolesService,
    private readonly mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto, role?: Role): Promise<User> {
    const { password } = createUserDto;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (role === undefined) {
      role = await this.rolesService.findOne(ConstRole.BUYER);
    }

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role,
      profile_picture: DEFAULT_PROFILE_PICTURE,
    });
    try {
      await this.userRepository.save(user);

      return user;
    } catch (error) {
      // duplicate by email in mysql
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Email sudah terdaftar');
      } else {
        throw new Error(error);
      }
    }
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      where: { is_verified: true },
      relations: ['role'],
    });
  }

  async findOneById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, is_verified: true },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException('User does not exist!');
    }

    return user;
  }

  async findOneByIdNotVerified(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException('User does not exist!');
    }

    return user;
  }

  async findOneByEmail(
    email: string,
    isCustomRole: boolean,
    roleId?: number,
  ): Promise<User> {
    if (isCustomRole) {
      return await this.userRepository
        .createQueryBuilder('user')
        .select()
        .leftJoinAndSelect('user.role', 'role')
        .where('user.email = :email', { email })
        .andWhere('user.is_verified = true')
        .andWhere('user.role = :roleId', { roleId })
        .getOne();
    }

    const user = await this.userRepository.findOne({
      where: { email, is_verified: true },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException('User does not exist!');
    }

    return user;
  }

  async findOneByEmailNotVerified(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException('User does not exist!');
    }

    return user;
  }

  async findOneByEmailAndRole(email: string, role: Role): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email, role },
      relations: ['role'],
    });

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const updateUser = await this.userRepository.update(id, updateUserDto);
    if (updateUser.affected === 0) {
      throw new NotFoundException('User does not exist!');
    }

    return await this.findOneById(id);
  }

  async remove(id: number): Promise<void> {
    const removeUser = await this.userRepository.softDelete(id);
    if (removeUser.affected === 0) {
      throw new NotFoundException('User does not exist!');
    }
  }

  async uploadImageToCloudinary(
    id: number,
    file: Express.Multer.File,
  ): Promise<void> {
    const uploadImage = await this.cloudinaryService.uploadImage(
      file,
      CLOUDINARY_FOLDER_USER,
    );

    const updateUser = await this.userRepository.update(id, {
      profile_picture: uploadImage.secure_url,
    });
    if (updateUser.affected === 0) {
      throw new NotFoundException('User does not exist!');
    }
  }

  async changeRole(id: number, role: Role): Promise<UpdateResult> {
    return await this.userRepository.update(id, {
      role,
    });
  }

  async changePassword(id: number, password: string): Promise<User> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await this.userRepository.update(id, {
      password: hashedPassword,
    });

    return await this.findOneById(id);
  }

  async checkUser(createUserDto: CreateUserDto): Promise<User> {
    const { password } = createUserDto;

    const user = await this.userRepository.findOne({
      where: { email: createUserDto.email },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException('User does not exist!');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new NotFoundException('Password is incorrect!');
    }

    return user;
  }

  async countUsers(date: Date): Promise<{
    total_shops_count;
    total_buyers_count;
    monthly_shops_count;
    monthly_buyers_count;
  }> {
    const sellerRole = await this.rolesService.findOne(ConstRole.SELLER);
    const buyerRole = await this.rolesService.findOne(ConstRole.BUYER);

    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

    const shopCount = await this.userRepository.count({
      where: { role: sellerRole },
    });

    const buyerCount = await this.userRepository.count({
      where: { role: buyerRole },
    });

    const monthlyShopCount = await this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: sellerRole.id })
      .andWhere('user.created_at BETWEEN :firstDay AND :lastDay', {
        firstDay: firstDayOfMonth,
        lastDay: lastDayOfMonth,
      })
      .getCount();

    const monthlyBuyerCount = await this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: buyerRole.id })
      .andWhere('user.created_at BETWEEN :firstDay AND :lastDay', {
        firstDay: firstDayOfMonth,
        lastDay: lastDayOfMonth,
      })
      .getCount();

    return {
      total_shops_count: shopCount,
      total_buyers_count: buyerCount,
      monthly_shops_count: monthlyShopCount,
      monthly_buyers_count: monthlyBuyerCount,
    };
  }
}
