import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../generated/prisma/client';
import { AuthUser } from '../auth-user';
import { describeRoles, ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Rota sem @Roles: qualquer usuario autenticado acessa.
    if (!roles || roles.length === 0) {
      return true;
    }

    const user = context.switchToHttp().getRequest<{ user?: AuthUser }>().user;

    // Tokens emitidos antes da migration nao trazem role e caem aqui.
    if (!user?.role || !roles.includes(user.role)) {
      throw new ForbiddenException(`Acesso permitido somente para ${describeRoles(roles)}.`);
    }

    return true;
  }
}
