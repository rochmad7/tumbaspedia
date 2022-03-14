import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt/jwt-payload.interface';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<void> {
    return this.usersService.create(registerUserDto);
  }

  async login(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ access_token: string }> {
    const { email, password } = authCredentialsDto;
    const user = await this.usersService.findOneByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = {
        user: { id: user.id, role_id: user.role.id },
      };
      const accessToken = this.jwtService.sign(payload);
      return { access_token: accessToken };
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
