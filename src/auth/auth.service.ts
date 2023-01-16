import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
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
import { MailService } from '../mail/mail.service';
import { use } from 'passport';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly shopsService: ShopsService,
    private readonly rolesService: RolesService,
    private readonly mailService: MailService,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const user = await this.usersService.create(registerUserDto);

    const token = this.jwtService.sign({
      email: user.email,
    });

    await this.mailService.sendUserConfirmation(user.name, user.email, token);

    return user;
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

    const token = this.jwtService.sign({
      id: user.id,
    });

    await this.mailService.sendShopConfirmation(
      shop.name,
      shop.user.email,
      token,
    );

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
    const user = await this.usersService.findOneByEmail(
      email,
      true,
      ConstRole.BUYER,
    );
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
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

  async loginAdmin(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ access_token: string; user: User }> {
    const { email, password } = authCredentialsDto;
    const user = await this.usersService.findOneByEmail(
      email,
      true,
      ConstRole.ADMIN,
    );

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
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
    const user = await this.usersService.findOneByEmail(
      email,
      true,
      ConstRole.SELLER,
    );
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const shop = await this.shopsService.findOneByUserID(user.id);

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: ShopJwtPayload = {
        user: {
          id: user.id,
          role_id: ConstRole.SELLER,
        },
        shop_id: shop.id,
      };

      const accessToken = this.jwtService.sign(payload);

      return { access_token: accessToken, shop };
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async confirmUser(token: string): Promise<User> {
    const verifyToken = this.jwtService.verify(token);
    const user = await this.usersService.findOneByEmailNotVerified(
      verifyToken.email,
    );
    if (!user.is_verified) {
      await this.usersService.update(user.id, {
        is_verified: true,
      });
      user.is_verified = true;
    }
    return user;
  }

  async confirmShop(token: string): Promise<Shop> {
    const verifyToken = this.jwtService.verify(token);
    const user = await this.usersService.findOneByIdNotVerified(verifyToken.id);
    if (!user.is_verified) {
      await this.usersService.update(user.id, {
        is_verified: true,
      });
      user.is_verified = true;
    }

    const shop = await this.shopsService.findOneByUserID(user.id);
    if (!shop.is_verified) {
      await this.shopsService.update(shop.id, {
        is_verified: true,
      });
      shop.is_verified = true;
    }

    return shop;
  }

  async sendResetPasswordEmail(email: string, type: string): Promise<void> {
    let roleID = ConstRole.BUYER;
    if (type === 'seller') {
      roleID = ConstRole.SELLER;
    }
    const user = await this.usersService.findOneByEmail(email, true, roleID);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const token = this.jwtService.sign({
      email: user.email,
    });

    await this.mailService.sendPasswordReset(user.email, token);
  }

  async resetPassword(token: string, password: string): Promise<User> {
    const verifyToken = this.jwtService.verify(token);
    const user = await this.usersService.findOneByEmailNotVerified(
      verifyToken.email,
    );
    if (user) {
      await this.usersService.update(user.id, {
        password: await bcrypt.hash(password, 10),
      });
    }
    return user;
  }

  async isNIBNumberAvailable(nib_number: string): Promise<boolean> {
    const shop = await this.shopsService.findShopByNIBNumber(nib_number);

    return !shop;
  }
}
