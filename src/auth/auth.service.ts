import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, ShopJwtPayload } from './jwt/jwt-payload.interface';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { ConstRole } from '../constants';
import { ShopsService } from '../shops/shops.service';
import { User } from '../users/entities/user.entity';
import { Shop } from '../shops/entities/shop.entity';
import { RegisterShopDto } from './dto/register-shop.dto';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly shopsService: ShopsService,
    private readonly rolesService: RolesService,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<void> {
    return this.usersService.create(registerUserDto);
  }

  async registerShop(
    registerUserDto: RegisterUserDto,
    registerShopDto: RegisterShopDto,
    // files: {
    //   shop_picture?: Express.Multer.File[];
    //   shop_nib?: Express.Multer.File[];
    // },
  ): Promise<{ access_token: string; shop: Shop }> {
    const role = await this.rolesService.findOne(ConstRole.SELLER);

    await this.usersService.create(registerUserDto, role);

    const user = await this.usersService.findOneByEmailAndRole(
      registerUserDto.email,
      role,
    );

    const shop = await this.shopsService.create(user.id, registerShopDto);

    const payload: ShopJwtPayload = {
      user: {
        id: user.id,
        role_id: user.role.id,
      },
      shop_id: shop.id,
    };
    const accessToken = this.jwtService.sign(payload);

    return { access_token: accessToken, shop };
  }

  async login(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ access_token: string; user: User }> {
    const { email, password } = authCredentialsDto;
    const user = await this.usersService.findOneByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = {
        user: { id: user.id, role_id: user.role.id },
      };
      const accessToken = this.jwtService.sign(payload);
      return { access_token: accessToken, user };
    } else {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
  }

  async loginAdmin(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ access_token: string; user: User }> {
    const { email, password } = authCredentialsDto;
    const user = await this.usersService.findOneByEmail(email);

    if (user.role.id !== ConstRole.ADMIN) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = {
        user: { id: user.id, role_id: user.role.id },
      };
      const accessToken = this.jwtService.sign(payload);
      return { access_token: accessToken, user };
    } else {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
  }

  async loginShop(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ access_token: string; shop: Shop }> {
    const { email, password } = authCredentialsDto;
    const user = await this.usersService.findOneByEmail(email);
    if (user.role.id !== ConstRole.SELLER) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const shop = await this.shopsService.findOneByUserID(user.id);

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: ShopJwtPayload = {
        user: {
          id: user.id,
          role_id: user.role.id,
        },
        shop_id: shop.id,
      };
      const accessToken = this.jwtService.sign(payload);
      return { access_token: accessToken, shop };
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
