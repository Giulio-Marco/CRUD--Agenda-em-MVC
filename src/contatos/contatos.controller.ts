import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthUser } from '../auth/auth-user';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ContatosService } from './contatos.service';
import { CreateContatoDto } from './dto/create-contato.dto';
import { UpdateContatoDto } from './dto/update-contato.dto';

@ApiTags('contatos')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ALUNO')
@Controller('contatos')
export class ContatosController {
  constructor(private readonly contatosService: ContatosService) {}

  @Get()
  @ApiOperation({ summary: 'Lista somente os contatos do usuário autenticado' })
  findAll(@Request() request: { user: AuthUser }) {
    return this.contatosService.findAll(request.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Cria um contato para o usuário autenticado' })
  create(
    @Request() request: { user: AuthUser },
    @Body() createContatoDto: CreateContatoDto,
  ) {
    return this.contatosService.create(request.user.userId, createContatoDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um contato do usuário autenticado' })
  @ApiNotFoundResponse({ description: 'Contato não encontrado para este usuário.' })
  update(
    @Request() request: { user: AuthUser },
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContatoDto: UpdateContatoDto,
  ) {
    return this.contatosService.update(request.user.userId, id, updateContatoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um contato do usuário autenticado' })
  @ApiNoContentResponse({ description: 'Contato removido.' })
  @ApiNotFoundResponse({ description: 'Contato não encontrado para este usuário.' })
  remove(
    @Request() request: { user: AuthUser },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.contatosService.remove(request.user.userId, id);
  }
}
