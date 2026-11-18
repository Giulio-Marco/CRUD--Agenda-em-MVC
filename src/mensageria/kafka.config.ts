/** Token de injecao do ClientKafka (produtor). */
export const KAFKA_CLIENT = 'KAFKA_CLIENT';

/** Topico publicado apos o cadastro de um aluno (POST /auth/register). */
export const TOPICO_USUARIO_REGISTRADO = 'usuario.registrado';

/** Topico publicado quando o aluno conclui a ultima aula de um curso (PUT /aulas/:id/progresso). */
export const TOPICO_CURSO_CONCLUIDO = 'curso.concluido';

/** Grupo do consumidor de notificacoes. O Nest acrescenta "-server": no Kafka aparece "notificacoes-server". */
export const GRUPO_NOTIFICACOES = 'notificacoes';

export interface UsuarioRegistradoEvento {
  idUser: number;
  email: string;
  nome: string | null;
  /** Data ISO 8601 do cadastro. */
  dataCadastro: string;
}

/**
 * idUser e o id da tabela User (auth, vem do JWT), nao o idUsuario da tabela Usuario (plataforma).
 * As duas tabelas se ligam pelo e-mail (UsersService.ensurePlatformUser).
 */
export interface CursoConcluidoEvento {
  idUser: number;
  idCurso: number;
  tituloCurso: string;
}

/** Brokers vindos de KAFKA_BROKERS (separados por virgula). Padrao: localhost:9092. */
export function kafkaBrokers(): string[] {
  return (process.env.KAFKA_BROKERS ?? 'localhost:9092')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);
}
