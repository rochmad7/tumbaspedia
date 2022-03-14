import { User } from '../../users/entities/user.entity';

export interface JwtPayload {
  user: {
    id: number;
    role_id: number;
  };
}
