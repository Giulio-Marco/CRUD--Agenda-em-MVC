import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContatoDto } from './dto/create-contato.dto';
import { UpdateContatoDto } from './dto/update-contato.dto';

@Injectable()
export class ContatosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: number) {
    return this.prisma.contato.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(userId: number, createContatoDto: CreateContatoDto) {
    return this.prisma.contato.create({
      data: {
        ...createContatoDto,
        nome: createContatoDto.nome.trim(),
        telefone: createContatoDto.telefone.trim(),
        email: createContatoDto.email.toLowerCase().trim(),
        userId,
      },
    });
  }

  async update(userId: number, id: number, updateContatoDto: UpdateContatoDto) {
    await this.findOwnedContact(userId, id);

    return this.prisma.contato.update({
      where: { id },
      data: {
        ...updateContatoDto,
        ...(updateContatoDto.nome && { nome: updateContatoDto.nome.trim() }),
        ...(updateContatoDto.telefone && { telefone: updateContatoDto.telefone.trim() }),
        ...(updateContatoDto.email && { email: updateContatoDto.email.toLowerCase().trim() }),
      },
    });
  }

  async remove(userId: number, id: number) {
    await this.findOwnedContact(userId, id);
    await this.prisma.contato.delete({ where: { id } });
  }

  private async findOwnedContact(userId: number, id: number) {
    const contato = await this.prisma.contato.findFirst({ where: { id, userId } });

    if (!contato) {
      throw new NotFoundException('Contato não encontrado.');
    }

    return contato;
  }
}
