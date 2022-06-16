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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private cloudinaryService: CloudinaryService,
    private readonly rolesService: RolesService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<void> {
    const { password } = createUserDto;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const role = await this.rolesService.findOne(ConstRole.BUYER);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role,
      profile_picture: DEFAULT_PROFILE_PICTURE,
    });
    try {
      await this.userRepository.save(user);
    } catch (error) {
      // duplicate by postgres
      if (error.code === '23505') {
        throw new ConflictException('Email already exists');
      } else {
        throw new Error(error);
      }
    }
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOneById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User does not exist!');
    }

    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
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
}
