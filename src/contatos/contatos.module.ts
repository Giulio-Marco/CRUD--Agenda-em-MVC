import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ContatosController } from './contatos.controller';
import { ContatosService } from './contatos.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ContatosController],
  providers: [ContatosService],
})
export class ContatosModule {}
