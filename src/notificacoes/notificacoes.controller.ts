import { Controller, Get, Param, ParseIntPipe, Patch, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthUser } from '../auth/auth-user';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { NotificacaoDto } from './dto/notificacao.dto';
import { NotificacoesService } from './notificacoes.service';

@ApiTags('notificacoes')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ALUNO')
@Controller('notificacoes')
export class NotificacoesController {
  constructor(private readonly notificacoesService: NotificacoesService) {}

  @Get()
  @ApiOperation({
    summary: 'Lista as notificacoes do aluno autenticado, mais recentes primeiro',
    description: 'A notificacao de boas-vindas e gravada pelo consumidor Kafka do topico usuario.registrado.',
  })
  @ApiOkResponse({ type: [NotificacaoDto] })
  listar(@Request() request: { user: AuthUser }) {
    return this.notificacoesService.listar(request.user.userId);
  }

  @Patch(':id/lida')
  @ApiOperation({ summary: 'Marca uma notificacao do aluno autenticado como lida' })
  @ApiOkResponse({ type: NotificacaoDto })
  @ApiNotFoundResponse({ description: 'Notificacao nao encontrada para este usuario.' })
  marcarComoLida(@Request() request: { user: AuthUser }, @Param('id', ParseIntPipe) id: number) {
    return this.notificacoesService.marcarComoLida(request.user.userId, id);
  }
}
