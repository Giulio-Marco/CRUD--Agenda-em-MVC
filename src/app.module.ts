import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ContatosModule } from './contatos/contatos.module';
import { CursosModule } from './cursos/cursos.module';
import { PlataformaModule } from './plataforma/plataforma.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, ContatosModule, CursosModule, PlataformaModule],
})
export class AppModule {}
