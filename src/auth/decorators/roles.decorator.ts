import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiForbiddenResponse } from '@nestjs/swagger';
import { Role } from '../../generated/prisma/client';

export const ROLES_KEY = 'roles';

const ROLE_LABEL: Record<Role, string> = {
  [Role.ADMIN]: 'administradores',
  [Role.ALUNO]: 'alunos',
};

export function describeRoles(roles: Role[]) {
  return roles.map((role) => ROLE_LABEL[role]).join(' ou ');
}

/**
 * Grava os papeis aceitos (lidos pelo RolesGuard) e documenta o 403 no Swagger.
 * Use junto de @UseGuards(JwtAuthGuard, RolesGuard).
 */
export function Roles(...roles: Role[]) {
  return applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    ApiForbiddenResponse({ description: `Acesso permitido somente para ${describeRoles(roles)}.` }),
  );
}
