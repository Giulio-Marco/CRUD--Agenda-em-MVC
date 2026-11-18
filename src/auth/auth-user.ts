import { Role } from '../generated/prisma/client';

export interface AuthUser {
  userId: number;
  email: string;
  role: Role;
}

export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
}
