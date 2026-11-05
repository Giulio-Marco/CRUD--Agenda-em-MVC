import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';

type ErrorMapping = { status: HttpStatus; error: string; message: string };
type HttpResponse = { status(code: number): { json(body: unknown): unknown } };

/**
 * Converte erros conhecidos do Prisma em respostas HTTP. Sem este filtro,
 * violacao de unique (ex.: modulo com ordem repetida) chega ao cliente como 500.
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<HttpResponse>();
    const { status, error, message } = this.map(exception);

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`Prisma ${exception.code}: ${exception.message}`, exception.stack);
    }

    response.status(status).json({ statusCode: status, message, error });
  }

  private map(exception: Prisma.PrismaClientKnownRequestError): ErrorMapping {
    switch (exception.code) {
      case 'P2002': {
        const fields = this.uniqueFields(exception);
        const suffix = fields.length > 0 ? ` (campos: ${fields.join(', ')})` : '';
        return {
          status: HttpStatus.CONFLICT,
          error: 'Conflict',
          message: `Ja existe um registro com esses dados${suffix}.`,
        };
      }
      case 'P2025':
        return { status: HttpStatus.NOT_FOUND, error: 'Not Found', message: 'Registro nao encontrado.' };
      case 'P2003':
        return {
          status: HttpStatus.CONFLICT,
          error: 'Conflict',
          message: 'Registro possui vinculos e nao pode ser excluido ou alterado.',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
          message: 'Erro interno no banco de dados.',
        };
    }
  }

  // O Prisma classico preenche meta.target; com driver adapter (pg) os campos vem em driverAdapterError.
  private uniqueFields(exception: Prisma.PrismaClientKnownRequestError): string[] {
    const meta = exception.meta as Record<string, any> | undefined;
    const target = meta?.target ?? meta?.driverAdapterError?.cause?.constraint?.fields;

    const fields = Array.isArray(target) ? target : typeof target === 'string' ? [target] : [];
    // O Postgres devolve nomes de coluna entre aspas ("Nome"); a mensagem mostra so o nome.
    return fields.map((field) => String(field).replace(/"/g, ''));
  }
}
