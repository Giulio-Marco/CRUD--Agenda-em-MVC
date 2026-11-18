import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CursoConcluidoConsumer } from './curso-concluido.consumer';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificacoesController } from './notificacoes.controller';
import { NotificacoesService } from './notificacoes.service';
import { UsuarioRegistradoConsumer } from './usuario-registrado.consumer';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [NotificacoesController, UsuarioRegistradoConsumer, CursoConcluidoConsumer],
  providers: [NotificacoesService],
})
export class NotificacoesModule {}
