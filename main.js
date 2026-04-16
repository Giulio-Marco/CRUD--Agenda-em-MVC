import { AgendaController } from './agenda-contatos/controller/AgendaController.js';

document.addEventListener('DOMContentLoaded', () => {
  const app = new AgendaController();
  app.inicializar();
});
