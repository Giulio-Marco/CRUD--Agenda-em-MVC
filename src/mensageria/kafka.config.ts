/** Token de injecao do ClientKafka (produtor). */
export const KAFKA_CLIENT = 'KAFKA_CLIENT';

/** Topico publicado apos o cadastro de um aluno (POST /auth/register). */
export const TOPICO_USUARIO_REGISTRADO = 'usuario.registrado';

/** Grupo do consumidor de notificacoes. O Nest acrescenta "-server": no Kafka aparece "notificacoes-server". */
export const GRUPO_NOTIFICACOES = 'notificacoes';

export interface UsuarioRegistradoEvento {
  idUser: number;
  email: string;
  nome: string | null;
  /** Data ISO 8601 do cadastro. */
  dataCadastro: string;
}

/** Brokers vindos de KAFKA_BROKERS (separados por virgula). Padrao: localhost:9092. */
export function kafkaBrokers(): string[] {
  return (process.env.KAFKA_BROKERS ?? 'localhost:9092')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);
}
