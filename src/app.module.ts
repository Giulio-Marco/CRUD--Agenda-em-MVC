import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { ContatosModule } from './contatos/contatos.module';
import { CursosModule } from './cursos/cursos.module';
import { NotificacoesModule } from './notificacoes/notificacoes.module';
import { PlataformaModule } from './plataforma/plataforma.module';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, ContatosModule, CursosModule, PlataformaModule, NotificacoesModule],
  providers: [{ provide: APP_FILTER, useClass: PrismaExceptionFilter }],
})
export class AppModule {}
