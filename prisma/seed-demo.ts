// Recria os dados de demonstracao do catalogo (cursos, trilhas, planos...).
// Apaga somente catalogo e dados de teste; usuarios e contatos ficam intactos.
// Uso: npm run seed:demo (pede confirmacao no terminal antes de apagar).
import 'dotenv/config';
import 'reflect-metadata';
import { createInterface } from 'node:readline/promises';
import { PrismaService } from '../src/prisma/prisma.service';

type AulaSeed = {
  titulo: string;
  tipoConteudo: 'video' | 'leitura' | 'exercicio';
  urlConteudo: string;
  duracaoMinutos: number;
};

type ModuloSeed = {
  titulo: string;
  aulas: AulaSeed[];
};

type CursoSeed = {
  chave: string;
  titulo: string;
  descricao: string;
  nivel: 'Iniciante' | 'Intermediário' | 'Avançado';
  categoria: string;
  modulos: ModuloSeed[];
};

const CATEGORIAS = [
  { nome: 'Programação', descricao: 'Linguagens, frameworks e desenvolvimento de aplicações web e mobile.' },
  { nome: 'Dados', descricao: 'Bancos de dados, análise e manipulação de dados.' },
  { nome: 'Design', descricao: 'Interfaces, experiência do usuário e comunicação visual de informações.' },
];

const CURSOS: CursoSeed[] = [
  {
    chave: 'js',
    titulo: 'JavaScript Moderno',
    descricao:
      'Do básico ao ES2023: variáveis, funções, objetos, módulos e programação assíncrona com Promises e async/await. Base para qualquer framework web ou mobile.',
    nivel: 'Iniciante',
    categoria: 'Programação',
    modulos: [
      {
        titulo: 'Fundamentos da linguagem',
        aulas: [
          { titulo: 'Variáveis, tipos e operadores', tipoConteudo: 'leitura', urlConteudo: 'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Grammar_and_types', duracaoMinutos: 25 },
          { titulo: 'Funções e escopo', tipoConteudo: 'leitura', urlConteudo: 'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Functions', duracaoMinutos: 30 },
          { titulo: 'Exercício: calculadora de médias', tipoConteudo: 'exercicio', urlConteudo: 'https://developer.mozilla.org/pt-BR/docs/Learn/JavaScript/First_steps', duracaoMinutos: 40 },
        ],
      },
      {
        titulo: 'Objetos, arrays e módulos',
        aulas: [
          { titulo: 'Trabalhando com arrays', tipoConteudo: 'leitura', urlConteudo: 'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array', duracaoMinutos: 30 },
          { titulo: 'Módulos import e export', tipoConteudo: 'leitura', urlConteudo: 'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Modules', duracaoMinutos: 20 },
        ],
      },
      {
        titulo: 'Programação assíncrona',
        aulas: [
          { titulo: 'Promises na prática', tipoConteudo: 'leitura', urlConteudo: 'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Using_promises', duracaoMinutos: 35 },
          { titulo: 'async/await e fetch', tipoConteudo: 'exercicio', urlConteudo: 'https://developer.mozilla.org/pt-BR/docs/Web/API/Fetch_API/Using_Fetch', duracaoMinutos: 45 },
        ],
      },
    ],
  },
  {
    chave: 'nest',
    titulo: 'APIs com NestJS e Prisma',
    descricao:
      'Construa uma API REST completa com NestJS, Prisma e PostgreSQL: módulos, controllers, validação de dados, autenticação JWT e documentação com Swagger.',
    nivel: 'Intermediário',
    categoria: 'Programação',
    modulos: [
      {
        titulo: 'Estrutura de um projeto NestJS',
        aulas: [
          { titulo: 'Módulos, controllers e providers', tipoConteudo: 'leitura', urlConteudo: 'https://docs.nestjs.com/modules', duracaoMinutos: 30 },
          { titulo: 'Validação com class-validator', tipoConteudo: 'leitura', urlConteudo: 'https://docs.nestjs.com/techniques/validation', duracaoMinutos: 25 },
        ],
      },
      {
        titulo: 'Banco de dados com Prisma',
        aulas: [
          { titulo: 'Modelando o schema', tipoConteudo: 'leitura', urlConteudo: 'https://www.prisma.io/docs/orm/prisma-schema/data-model/models', duracaoMinutos: 35 },
          { titulo: 'Consultas e relações', tipoConteudo: 'leitura', urlConteudo: 'https://www.prisma.io/docs/orm/prisma-client/queries/crud', duracaoMinutos: 40 },
          { titulo: 'Exercício: CRUD de cursos', tipoConteudo: 'exercicio', urlConteudo: 'https://docs.nestjs.com/recipes/prisma', duracaoMinutos: 60 },
        ],
      },
      {
        titulo: 'Segurança e documentação',
        aulas: [
          { titulo: 'Autenticação com JWT', tipoConteudo: 'leitura', urlConteudo: 'https://docs.nestjs.com/security/authentication', duracaoMinutos: 45 },
          { titulo: 'Documentando com Swagger', tipoConteudo: 'leitura', urlConteudo: 'https://docs.nestjs.com/openapi/introduction', duracaoMinutos: 20 },
        ],
      },
    ],
  },
  {
    chave: 'rn',
    titulo: 'Apps com React Native e Expo',
    descricao:
      'Crie aplicativos para iPhone e Android com React Native e Expo: componentes, Flexbox, listas, navegação entre telas e consumo de uma API real.',
    nivel: 'Intermediário',
    categoria: 'Programação',
    modulos: [
      {
        titulo: 'Componentes e layout',
        aulas: [
          { titulo: 'Componentes nativos essenciais', tipoConteudo: 'leitura', urlConteudo: 'https://reactnative.dev/docs/components-and-apis', duracaoMinutos: 25 },
          { titulo: 'Layout com Flexbox', tipoConteudo: 'leitura', urlConteudo: 'https://reactnative.dev/docs/flexbox', duracaoMinutos: 30 },
          { titulo: 'Listas com FlatList', tipoConteudo: 'exercicio', urlConteudo: 'https://reactnative.dev/docs/flatlist', duracaoMinutos: 40 },
        ],
      },
      {
        titulo: 'Navegação e dados',
        aulas: [
          { titulo: 'Stack e abas com React Navigation', tipoConteudo: 'leitura', urlConteudo: 'https://reactnavigation.org/docs/getting-started', duracaoMinutos: 35 },
          { titulo: 'Consumindo uma API com fetch', tipoConteudo: 'leitura', urlConteudo: 'https://reactnative.dev/docs/network', duracaoMinutos: 30 },
          { titulo: 'Testando no Expo Go', tipoConteudo: 'video', urlConteudo: 'https://docs.expo.dev/get-started/expo-go/', duracaoMinutos: 15 },
        ],
      },
    ],
  },
  {
    chave: 'sql',
    titulo: 'SQL com PostgreSQL',
    descricao:
      'Aprenda a consultar e modelar dados com SQL no PostgreSQL: SELECT, filtros, JOINs, agregações e índices para consultas rápidas.',
    nivel: 'Iniciante',
    categoria: 'Dados',
    modulos: [
      {
        titulo: 'Primeiras consultas',
        aulas: [
          { titulo: 'SELECT, WHERE e ORDER BY', tipoConteudo: 'leitura', urlConteudo: 'https://www.postgresql.org/docs/current/tutorial-select.html', duracaoMinutos: 30 },
          { titulo: 'Exercício: consultando a tabela de cursos', tipoConteudo: 'exercicio', urlConteudo: 'https://www.postgresql.org/docs/current/tutorial-populate.html', duracaoMinutos: 35 },
        ],
      },
      {
        titulo: 'Relacionando tabelas',
        aulas: [
          { titulo: 'JOINs entre tabelas', tipoConteudo: 'leitura', urlConteudo: 'https://www.postgresql.org/docs/current/tutorial-join.html', duracaoMinutos: 35 },
          { titulo: 'Funções de agregação e GROUP BY', tipoConteudo: 'leitura', urlConteudo: 'https://www.postgresql.org/docs/current/tutorial-agg.html', duracaoMinutos: 30 },
          { titulo: 'Chaves estrangeiras', tipoConteudo: 'leitura', urlConteudo: 'https://www.postgresql.org/docs/current/tutorial-fk.html', duracaoMinutos: 20 },
        ],
      },
      {
        titulo: 'Desempenho',
        aulas: [
          { titulo: 'Índices e quando usá-los', tipoConteudo: 'leitura', urlConteudo: 'https://www.postgresql.org/docs/current/indexes-intro.html', duracaoMinutos: 25 },
          { titulo: 'Lendo planos com EXPLAIN', tipoConteudo: 'exercicio', urlConteudo: 'https://www.postgresql.org/docs/current/using-explain.html', duracaoMinutos: 40 },
        ],
      },
    ],
  },
  {
    chave: 'python',
    titulo: 'Python para Análise de Dados',
    descricao:
      'Use Python, pandas e Jupyter para importar, limpar e explorar conjuntos de dados reais, respondendo perguntas de negócio com código.',
    nivel: 'Intermediário',
    categoria: 'Dados',
    modulos: [
      {
        titulo: 'Primeiros passos com pandas',
        aulas: [
          { titulo: 'Series e DataFrames', tipoConteudo: 'leitura', urlConteudo: 'https://pandas.pydata.org/docs/user_guide/10min.html', duracaoMinutos: 35 },
          { titulo: 'Lendo arquivos CSV e Excel', tipoConteudo: 'leitura', urlConteudo: 'https://pandas.pydata.org/docs/user_guide/io.html', duracaoMinutos: 25 },
        ],
      },
      {
        titulo: 'Limpeza e transformação',
        aulas: [
          { titulo: 'Tratando dados ausentes', tipoConteudo: 'leitura', urlConteudo: 'https://pandas.pydata.org/docs/user_guide/missing_data.html', duracaoMinutos: 30 },
          { titulo: 'Agrupando com groupby', tipoConteudo: 'leitura', urlConteudo: 'https://pandas.pydata.org/docs/user_guide/groupby.html', duracaoMinutos: 35 },
          { titulo: 'Exercício: análise de matrículas', tipoConteudo: 'exercicio', urlConteudo: 'https://pandas.pydata.org/docs/getting_started/intro_tutorials/index.html', duracaoMinutos: 50 },
        ],
      },
    ],
  },
  {
    chave: 'dataviz',
    titulo: 'Visualização de Dados e Dashboards',
    descricao:
      'Escolha o gráfico certo para cada pergunta, use cor e hierarquia com intenção e monte dashboards que ajudam a tomar decisões.',
    nivel: 'Iniciante',
    categoria: 'Design',
    modulos: [
      {
        titulo: 'Escolhendo o gráfico',
        aulas: [
          { titulo: 'Tipos de gráfico e quando usar', tipoConteudo: 'leitura', urlConteudo: 'https://matplotlib.org/stable/plot_types/index.html', duracaoMinutos: 25 },
          { titulo: 'Cor e acessibilidade em gráficos', tipoConteudo: 'leitura', urlConteudo: 'https://developer.mozilla.org/pt-BR/docs/Web/Accessibility', duracaoMinutos: 20 },
        ],
      },
      {
        titulo: 'Gráficos com código',
        aulas: [
          { titulo: 'Gráficos com Matplotlib', tipoConteudo: 'leitura', urlConteudo: 'https://matplotlib.org/stable/tutorials/pyplot.html', duracaoMinutos: 35 },
          { titulo: 'Gráficos direto do pandas', tipoConteudo: 'exercicio', urlConteudo: 'https://pandas.pydata.org/docs/user_guide/visualization.html', duracaoMinutos: 40 },
        ],
      },
      {
        titulo: 'Montando um dashboard',
        aulas: [
          { titulo: 'Layout e hierarquia de um dashboard', tipoConteudo: 'leitura', urlConteudo: 'https://www.nngroup.com/articles/dashboards-preattentive/', duracaoMinutos: 25 },
          { titulo: 'Projeto final: painel de cursos', tipoConteudo: 'exercicio', urlConteudo: 'https://matplotlib.org/stable/gallery/index.html', duracaoMinutos: 60 },
        ],
      },
    ],
  },
];

const TRILHAS = [
  {
    titulo: 'Desenvolvedor Full Stack',
    descricao: 'Da linguagem ao app no celular: JavaScript, uma API com NestJS e o app mobile que consome essa API.',
    categoria: 'Programação',
    cursos: ['js', 'nest', 'rn'],
  },
  {
    titulo: 'Analista de Dados',
    descricao: 'Consulte o banco com SQL, analise com Python e apresente os resultados em gráficos e dashboards.',
    categoria: 'Dados',
    cursos: ['sql', 'python', 'dataviz'],
  },
];

const PLANOS = [
  { nome: 'Mensal', descricao: 'Acesso a todos os cursos por 1 mês. Renove quando quiser.', preco: 49.9, duracaoMeses: 1 },
  { nome: 'Anual', descricao: 'Acesso a todos os cursos por 12 meses. Sai por menos de R$ 40 por mês.', preco: 479, duracaoMeses: 12 },
];

function readEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} nao definida no arquivo .env.`);
  return value;
}

async function confirmar(): Promise<boolean> {
  if (!process.stdin.isTTY) {
    console.error('Este script pede confirmacao no terminal. Rode npm run seed:demo em um terminal interativo.');
    return false;
  }

  console.log('Este script APAGA do banco:');
  console.log('  cursos, modulos, aulas, trilhas, categorias, planos,');
  console.log('  matriculas, progresso, avaliacoes, certificados, assinaturas e pagamentos.');
  console.log('Usuarios e contatos ficam intactos.');
  console.log(`Banco: ${process.env.DATABASE_URL?.replace(/\/\/[^@]*@/, '//***@') ?? '(DATABASE_URL vazia)'}`);

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const resposta = await rl.question('Digite "sim" para continuar: ');
    return resposta.trim().toLowerCase() === 'sim';
  } finally {
    rl.close();
  }
}

async function main() {
  const adminEmail = readEnv('ADMIN_EMAIL').toLowerCase();
  const prisma = new PrismaService();

  try {
    const instrutor = await prisma.usuario.findUnique({ where: { email: adminEmail } });
    if (!instrutor) {
      throw new Error(`Admin ${adminEmail} nao encontrado na plataforma. Rode npm run seed:admin antes.`);
    }

    if (!(await confirmar())) {
      console.log('Cancelado. Nada foi apagado.');
      return;
    }

    const resumo = await prisma.$transaction(
      async (tx) => {
        // Ordem das chaves estrangeiras: filhos antes dos pais.
        await tx.pagamento.deleteMany();
        await tx.assinatura.deleteMany();
        await tx.plano.deleteMany();
        await tx.certificado.deleteMany();
        await tx.avaliacao.deleteMany();
        await tx.progressoAula.deleteMany();
        await tx.matricula.deleteMany();
        await tx.trilhaCurso.deleteMany();
        await tx.trilha.deleteMany();
        await tx.aula.deleteMany();
        await tx.modulo.deleteMany();
        await tx.curso.deleteMany();
        await tx.categoria.deleteMany();

        const categorias = new Map<string, number>();
        for (const categoria of CATEGORIAS) {
          const criada = await tx.categoria.create({ data: categoria });
          categorias.set(categoria.nome, criada.idCategoria);
        }

        const cursos = new Map<string, number>();
        let totalAulas = 0;
        for (const curso of CURSOS) {
          const aulas = curso.modulos.flatMap((modulo) => modulo.aulas);
          const minutos = aulas.reduce((soma, aula) => soma + aula.duracaoMinutos, 0);
          totalAulas += aulas.length;

          const criado = await tx.curso.create({
            data: {
              titulo: curso.titulo,
              descricao: curso.descricao,
              nivel: curso.nivel,
              idInstrutor: instrutor.idUsuario,
              idCategoria: categorias.get(curso.categoria)!,
              totalAulas: aulas.length,
              totalHoras: Math.round((minutos / 60) * 100) / 100,
              modulos: {
                create: curso.modulos.map((modulo, indiceModulo) => ({
                  titulo: modulo.titulo,
                  ordem: indiceModulo + 1,
                  aulas: {
                    create: modulo.aulas.map((aula, indiceAula) => ({ ...aula, ordem: indiceAula + 1 })),
                  },
                })),
              },
            },
          });
          cursos.set(curso.chave, criado.idCurso);
        }

        for (const trilha of TRILHAS) {
          await tx.trilha.create({
            data: {
              titulo: trilha.titulo,
              descricao: trilha.descricao,
              idCategoria: categorias.get(trilha.categoria)!,
              trilhasCursos: {
                create: trilha.cursos.map((chave, indice) => ({ idCurso: cursos.get(chave)!, ordem: indice + 1 })),
              },
            },
          });
        }

        for (const plano of PLANOS) {
          await tx.plano.create({ data: plano });
        }

        return {
          categorias: categorias.size,
          cursos: cursos.size,
          modulos: CURSOS.reduce((soma, curso) => soma + curso.modulos.length, 0),
          aulas: totalAulas,
          trilhas: TRILHAS.length,
          planos: PLANOS.length,
        };
      },
      { timeout: 30000 },
    );

    console.log(
      `Dados de demonstracao criados: ${resumo.categorias} categorias, ${resumo.cursos} cursos, ` +
        `${resumo.modulos} modulos, ${resumo.aulas} aulas, ${resumo.trilhas} trilhas e ${resumo.planos} planos.`,
    );
    console.log(`Instrutor dos cursos: ${instrutor.nomeCompleto} (${instrutor.email}).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
