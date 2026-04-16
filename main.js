import { AgendaController } from './agenda-contatos/controller/AgendaController.mjs';

document.addEventListener('DOMContentLoaded', () => {
  const app = new AgendaController();
  app.inicializar();
});
