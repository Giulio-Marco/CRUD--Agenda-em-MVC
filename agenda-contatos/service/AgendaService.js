import { Contato } from '../model/Contato.js';

const STORAGE_KEY = 'agenda_contatos';

export class AgendaService {
  getContatos() {
    const dados = localStorage.getItem(STORAGE_KEY);
    return dados ? JSON.parse(dados) : [];
  }

  saveContato(dadosContato) {
    const erros = Contato.validar(dadosContato);
    if (erros.length) {
      throw new Error(erros.join(' | '));
    }

    const lista = this.getContatos();
    const contato = new Contato(dadosContato);
    lista.push(contato);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    return contato;
  }

  deleteContato(id) {
    const lista = this.getContatos().filter((contato) => contato.id !== Number(id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  }
}
