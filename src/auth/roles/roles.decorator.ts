import { SetMetadata } from '@nestjs/common';
import { ConstRole } from '../../constants';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ConstRole[]) => SetMetadata(ROLES_KEY, roles);
