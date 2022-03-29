import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<void> {
    const { password } = createUserDto;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
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

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOneById(id: number): Promise<User> {
    const user = this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException('User does not exist!');
    }

    return user;
  }

  findOneByEmail(email: string): Promise<User> {
    const user = this.userRepository.findOne({ email });
    if (!user) {
      throw new NotFoundException('User does not exist!');
    }

    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UpdateResult> {
    const updateUser = await this.userRepository.update(id, updateUserDto);
    if (updateUser.affected === 0) {
      throw new NotFoundException('User does not exist!');
    }

    return updateUser;
  }

  remove(id: number): Promise<DeleteResult> {
    return this.userRepository.delete(id);
  }

  async getByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ email });
    if (user) {
      return user;
    }
    throw new NotFoundException('User does not exist!');
  }

  async uploadImageToCloudinary(
    id: number,
    file: Express.Multer.File,
  ): Promise<UpdateResult> {
    const uploadImage = await this.cloudinaryService.uploadImage(file);

    return await this.userRepository.update(id, {
      profile_picture: uploadImage.secure_url,
    });
  }

  async changeRole(id: number, role: Role): Promise<UpdateResult> {
    return await this.userRepository.update(id, {
      role,
    });
  }
}
