import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const email = createUserDto.email.toLowerCase().trim();
    const existingUser = await this.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Este e-mail já está cadastrado.');
    }

    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(createUserDto.password, salt);

    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name.trim(),
        email,
        password,
        // Cadastro publico sempre cria ALUNO; um role vindo no corpo e ignorado.
        role: Role.ALUNO,
      },
      select: publicUserSelect,
    });

    await this.ensurePlatformUser({
      email,
      name: user.name,
      password,
    });

    return user;
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: publicUserSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return user;
  }

  async synchronizePlatformUser(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      return null;
    }

    await this.ensurePlatformUser(user);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async ensurePlatformUser(user: { email: string; name: string | null; password: string }) {
    const nomeCompleto = user.name?.trim() || user.email;

    return this.prisma.usuario.upsert({
      where: { email: user.email },
      update: {
        nomeCompleto,
        senhaHash: user.password,
      },
      create: {
        nomeCompleto,
        email: user.email,
        senhaHash: user.password,
      },
    });
  }
}
