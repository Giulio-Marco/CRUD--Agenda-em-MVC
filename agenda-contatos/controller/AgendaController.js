import { AgendaService } from '../service/AgendaService.mjs';

const service = new AgendaService();

export class AgendaController {
  constructor() {
    this.form = document.getElementById('form-contato');
    this.lista = document.getElementById('lista-contatos');
    this.feedback = document.getElementById('feedback');

    this.form.addEventListener('submit', (evento) => {
      evento.preventDefault();
      this.#adicionarContato();
    });

    this.lista.addEventListener('click', (evento) => {
      const botao = evento.target.closest('[data-id]');
      if (botao) {
        this.#removerContato(botao.dataset.id);
      }
    });
  }

  inicializar() {
    this.#renderLista();
  }

  #adicionarContato() {
    const dados = {
      nome: this.form.nome.value,
      telefone: this.form.telefone.value,
      email: this.form.email.value,
    };

    try {
      service.saveContato(dados);
      this.form.reset();
      this.#renderLista();
      this.#mostrarFeedback('Contato adicionado com sucesso.', 'sucesso');
    } catch (erro) {
      this.#mostrarFeedback(erro.message, 'erro');
    }
  }

  #removerContato(id) {
    if (!confirm('Deseja remover este contato?')) {
      return;
    }

    service.deleteContato(id);
    this.#renderLista();
    this.#mostrarFeedback('Contato removido com sucesso.', 'sucesso');
  }

  #renderLista() {
    const contatos = service.getContatos();

    if (contatos.length === 0) {
      this.lista.innerHTML = `
        <tr class="linha-vazia">
          <td colspan="4">Nenhum contato cadastrado no momento.</td>
        </tr>
      `;
      return;
    }

    this.lista.innerHTML = contatos.map((contato) => `
      <tr>
        <td>${contato.nome}</td>
        <td>${contato.telefone}</td>
        <td>${contato.email}</td>
        <td>
          <button class="btn-remover" data-id="${contato.id}" type="button">Remover</button>
        </td>
      </tr>
    `).join('');
  }

  #mostrarFeedback(mensagem, tipo) {
    this.feedback.textContent = mensagem;
    this.feedback.className = `feedback ${tipo} visivel`;

    setTimeout(() => {
      this.feedback.classList.remove('visivel');
    }, 3000);
  }
}
