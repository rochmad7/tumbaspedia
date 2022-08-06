import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, UpdateResult } from 'typeorm';
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
      // duplicate by postgres
      if (error.code === '23505') {
        throw new ConflictException('Email sudah terdaftar');
      } else {
        throw new Error(error);
      }
    }
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({ where: { is_verified: true } });
  }

  async findOneById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, is_verified: true },
    });
    if (!user) {
      throw new NotFoundException('User does not exist!');
    }

    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email, is_verified: true },
    });
    if (!user) {
      throw new NotFoundException('User does not exist!');
    }

    return user;
  }

  async findOneByEmailNotVerified(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException('User does not exist!');
    }

    return user;
  }

  async findOneByEmailAndRole(email: string, role: Role): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email, role, is_verified: true },
    });
    if (!user) {
      throw new NotFoundException('User does not exist!');
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<void> {
    const updateUser = await this.userRepository.update(id, updateUserDto);
    if (updateUser.affected === 0) {
      throw new NotFoundException('User does not exist!');
    }
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

  async changePassword(id: number, password: string): Promise<UpdateResult> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    return await this.userRepository.update(id, {
      password: hashedPassword,
    });
  }

  async checkUser(createUserDto: CreateUserDto): Promise<User> {
    const { password } = createUserDto;

    const user = await this.userRepository.findOne({
      where: { email: createUserDto.email },
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

  async countUsers(): Promise<{ shops_count; buyers_count }> {
    const sellerRole = await this.rolesService.findOne(ConstRole.SELLER);
    const buyerRole = await this.rolesService.findOne(ConstRole.BUYER);

    const shopCount = await this.userRepository.count({
      where: { role: sellerRole },
    });

    const buyerCount = await this.userRepository.count({
      where: { role: buyerRole },
    });

    return { shops_count: shopCount, buyers_count: buyerCount };
  }
}
