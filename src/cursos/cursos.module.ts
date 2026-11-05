import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { CursosController } from './cursos.controller';
import { CursosService } from './cursos.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CursosController],
  providers: [CursosService],
})
export class CursosModule {}
