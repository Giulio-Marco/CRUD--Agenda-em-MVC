import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '../generated/prisma/client';
import { AuthService } from './auth.service';
import { AuthUser } from './auth-user';
import { AuthResponseDto, AuthUserResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cadastra um aluno e já retorna um JWT',
    description: 'Cadastro público: a conta sempre nasce com papel ALUNO. Um campo role enviado é ignorado.',
  })
  @ApiOkResponse({ type: AuthResponseDto })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login de aluno',
    description: 'Aceita somente contas ALUNO. Administradores usam POST /auth/admin/login.',
  })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Credenciais inválidas.' })
  @ApiForbiddenResponse({ description: 'Conta de administrador: use o login de administrador.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto, Role.ALUNO);
  }

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login de administrador',
    description: 'Aceita somente contas ADMIN, criadas com npm run seed:admin. Alunos usam POST /auth/login.',
  })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Credenciais inválidas.' })
  @ApiForbiddenResponse({ description: 'Conta de aluno: use o login de aluno.' })
  async adminLogin(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto, Role.ADMIN);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('token')
  @ApiOperation({ summary: 'Retorna o usuário autenticado com o papel' })
  @ApiOkResponse({ type: AuthUserResponseDto })
  async me(@Request() request: { user: AuthUser }) {
    return this.authService.getProfile(request.user.userId);
  }
}
