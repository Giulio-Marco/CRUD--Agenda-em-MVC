export interface AuthUser {
  userId: number;
  email: string;
}

export interface JwtPayload {
  sub: number;
  email: string;
}
