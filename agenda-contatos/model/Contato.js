export class Contato {
  constructor({ id = null, nome, telefone, email }) {
    this.id = id ?? Date.now();
    this.nome = nome.trim();
    this.telefone = telefone.trim();
    this.email = email.trim();
  }

  static validar(dados) {
    const erros = [];

    if (!dados.nome?.trim()) erros.push('Nome obrigatorio.');
    if (!dados.telefone?.trim()) erros.push('Telefone obrigatorio.');
    if (!dados.email?.trim()) erros.push('E-mail obrigatorio.');

    return erros;
  }
}
