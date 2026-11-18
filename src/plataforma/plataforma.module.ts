import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PlataformaController } from './plataforma.controller';
import { PlataformaService } from './plataforma.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PlataformaController],
  providers: [PlataformaService],
})
export class PlataformaModule {}
