import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload, ShopJwtPayload } from './jwt-payload.interface';
import { ConfigService } from '@nestjs/config';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { ShopsService } from '../../shops/shops.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private shopsService: ShopsService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { user } = payload;
    const findUser: User = await this.usersService.findOneById(user.id);
    if (!findUser) {
      throw new UnauthorizedException();
    }

    const shop = await this.shopsService.findOneByUserID(user.id);
    if (!shop) {
      return findUser;
    }
    findUser.shop = shop;

    return findUser;
  }
}
