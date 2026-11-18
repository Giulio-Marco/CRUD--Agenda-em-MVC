// Cria ou atualiza o administrador a partir de ADMIN_EMAIL, ADMIN_PASSWORD e ADMIN_NAME do .env.
// Uso: npm run seed:admin
import 'dotenv/config';
import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { Role } from '../src/generated/prisma/client';
import { PrismaService } from '../src/prisma/prisma.service';
import { UsersService } from '../src/users/users.service';

function readEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} nao definida no arquivo .env.`);
  }

  return value;
}

async function main() {
  const email = readEnv('ADMIN_EMAIL').toLowerCase();
  const passwordPlain = readEnv('ADMIN_PASSWORD');
  const name = readEnv('ADMIN_NAME');

  if (passwordPlain.length < 6) {
    throw new Error('ADMIN_PASSWORD precisa ter pelo menos 6 caracteres.');
  }

  const prisma = new PrismaService();
  // Mesmo UsersService da API: a sincronizacao com Usuario usa ensurePlatformUser sem copiar logica.
  const usersService = new UsersService(prisma);

  try {
    const password = await bcrypt.hash(passwordPlain, await bcrypt.genSalt());
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, password, role: Role.ADMIN },
      create: { email, name, password, role: Role.ADMIN },
    });

    await usersService.ensurePlatformUser(user);
    console.log(`Administrador pronto: ${user.email} (id ${user.id}, papel ${user.role}).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
