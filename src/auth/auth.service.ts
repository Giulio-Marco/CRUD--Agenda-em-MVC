import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '../generated/prisma/client';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './auth-user';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const WRONG_LOGIN_MESSAGE: Record<Role, string> = {
  [Role.ADMIN]: 'Use o login de administrador.',
  [Role.ALUNO]: 'Use o login de aluno.',
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);
    return this.createSession(user);
  }

  async login(loginDto: LoginDto, expectedRole: Role) {
    const email = loginDto.email.toLowerCase().trim();
    const user = await this.usersService.findByEmail(email);

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    // Papel conferido somente depois da senha: quem erra a senha nao descobre o papel da conta.
    if (user.role !== expectedRole) {
      throw new ForbiddenException(WRONG_LOGIN_MESSAGE[user.role]);
    }

    await this.usersService.ensurePlatformUser(user);
    return this.createSession(user);
  }

  async getProfile(userId: number) {
    try {
      const user = await this.usersService.synchronizePlatformUser(userId);

      if (!user) {
        throw new UnauthorizedException('Usuario nao encontrado.');
      }

      return user;
    } catch {
      throw new UnauthorizedException('Usuário não encontrado.');
    }
  }

  private createSession(user: { id: number; email: string; name: string | null; role: Role }) {
    const publicUser = { id: user.id, email: user.email, name: user.name, role: user.role };
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return { access_token, user: publicUser };
  }
}
