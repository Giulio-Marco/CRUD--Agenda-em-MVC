import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

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

  async login(loginDto: LoginDto) {
    const email = loginDto.email.toLowerCase().trim();
    const user = await this.usersService.findByEmail(email);

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
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

  private createSession(user: { id: number; email: string; name: string | null }) {
    const publicUser = { id: user.id, email: user.email, name: user.name };
    const access_token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return { access_token, user: publicUser };
  }
}
