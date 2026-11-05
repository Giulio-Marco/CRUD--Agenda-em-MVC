import { AgendaService } from '../service/AgendaService.js?v=20261004-3';

const service = new AgendaService();

export class AgendaController {
  constructor() {
    this.authView = document.getElementById('auth-view');
    this.appView = document.getElementById('app-view');
    this.authForm = document.getElementById('form-auth');
    this.authFeedback = document.getElementById('auth-feedback');
    this.appFeedback = document.getElementById('app-feedback');
    this.contatoFeedback = document.getElementById('feedback-contato');
    this.authMode = 'login';
    this.currentView = 'cursos';
    this.contatos = [];
    this.categorias = [];
    this.assinaturas = [];
    this.matriculasRequestId = 0;
    this.trilhasRequestId = 0;
    this.assinaturasRequestId = 0;
    this.editandoId = null;

    this.authForm.addEventListener('submit', (event) => {
      event.preventDefault();
      void this.autenticar();
    });
    document.getElementById('btn-alternar-auth').addEventListener('click', () => this.alternarAuthMode());
    document.getElementById('btn-sair').addEventListener('click', () => this.sair());
    document.querySelectorAll('[data-view]').forEach((button) => {
      button.addEventListener('click', () => void this.mostrarView(button.dataset.view));
    });

    document.getElementById('form-curso').addEventListener('submit', (event) => {
      event.preventDefault();
      void this.criarCurso();
    });
    document.getElementById('form-trilha').addEventListener('submit', (event) => {
      event.preventDefault();
      void this.criarTrilha();
    });
    document.getElementById('form-categoria').addEventListener('submit', (event) => {
      event.preventDefault();
      void this.criarCategoria();
    });
    document.getElementById('form-plano').addEventListener('submit', (event) => {
      event.preventDefault();
      void this.criarPlano();
    });
    document.getElementById('form-pagamento').addEventListener('submit', (event) => {
      event.preventDefault();
      void this.criarPagamento();
    });
    document.getElementById('form-contato').addEventListener('submit', (event) => {
      event.preventDefault();
      void this.salvarContato();
    });
    document.getElementById('btn-cancelar').addEventListener('click', () => this.cancelarEdicao());
    document.getElementById('btn-recarregar-cursos').addEventListener('click', () => void this.carregarCursos());
    document.getElementById('btn-recarregar-matriculas').addEventListener('click', () => void this.carregarMatriculas());
    document.getElementById('btn-recarregar-trilhas').addEventListener('click', () => void this.carregarTrilhas());
    document.getElementById('btn-recarregar-assinaturas').addEventListener('click', () => void this.carregarAssinaturas());

    document.getElementById('lista-cursos').addEventListener('click', (event) => this.handleCourseAction(event));
    document.getElementById('course-detail').addEventListener('click', (event) => void this.handleCourseDetailAction(event));
    document.getElementById('course-detail').addEventListener('submit', (event) => {
      event.preventDefault();
      void this.handleCourseDetailAction(event);
    });
    document.getElementById('lista-planos').addEventListener('click', (event) => this.handlePlanAction(event));
    document.getElementById('lista-assinaturas').addEventListener('click', (event) => this.handlePlanAction(event));
    document.getElementById('lista-trilhas').addEventListener('click', (event) => void this.handleTrailAction(event));
    document.getElementById('lista-contatos').addEventListener('click', (event) => this.handleContactAction(event));
  }

  async inicializar() {
    if (!service.getToken()) {
      this.mostrarAuth();
      return;
    }

    try {
      const usuario = await service.me();
      this.mostrarApp(usuario);
      await this.carregarCursos();
    } catch {
      service.clearSession();
      this.mostrarAuth();
      this.mostrarMensagem(this.authFeedback, 'Sua sessao expirou. Entre novamente.', 'error');
    }
  }

  async autenticar() {
    const dados = Object.fromEntries(new FormData(this.authForm));
    const payload = this.authMode === 'register'
      ? dados
      : { email: dados.email, password: dados.password };

    try {
      const sessao = this.authMode === 'register'
        ? await service.register(payload)
        : await service.login(payload);
      service.setSession(sessao);
      this.authForm.reset();
      this.mostrarApp(sessao.user);
      await this.carregarCursos();
    } catch (error) {
      this.mostrarMensagem(this.authFeedback, error.message, 'error');
    }
  }

  async mostrarView(view) {
    this.currentView = view;
    document.querySelectorAll('.app-view').forEach((section) => {
      section.hidden = section.id !== `view-${view}`;
    });
    document.querySelectorAll('[data-view]').forEach((button) => {
      button.classList.toggle('active', button.dataset.view === view);
    });

    if (view === 'cursos') await this.carregarCursos();
    if (view === 'matriculas') await this.carregarMatriculas();
    if (view === 'trilhas') await this.carregarTrilhas();
    if (view === 'assinaturas') await this.carregarAssinaturas();
    if (view === 'contatos') await this.carregarContatos();
  }

  async carregarCursos() {
    try {
      const cursos = await service.getCursos();
      document.getElementById('stats-cursos').innerHTML = `
        <div class="stat"><span>Cursos publicados</span><strong>${cursos.length}</strong></div>
        <div class="stat"><span>Matriculas no catalogo</span><strong>${cursos.reduce((total, curso) => total + curso.totalMatriculados, 0)}</strong></div>
        <div class="stat"><span>Cursos matriculados</span><strong>${cursos.filter((curso) => curso.matriculado).length}</strong></div>
        <div class="stat"><span>Categorias</span><strong>${new Set(cursos.map((curso) => curso.categoria).filter(Boolean)).size}</strong></div>`;
      const lista = document.getElementById('lista-cursos');
      lista.innerHTML = cursos.length ? cursos.map((curso) => this.cursoHtml(curso)).join('') : '<div class="empty">Nenhum curso publicado. Use o formulario para criar o primeiro.</div>';
    } catch (error) {
      this.mostrarMensagem(this.appFeedback, error.message, 'error');
    }
  }

  cursoHtml(curso) {
    const button = curso.matriculado
      ? '<span class="tag">Matriculado</span>'
      : `<button class="btn-primary" data-action="matricular" data-id="${curso.idCurso}" type="button">Matricular</button>`;
    return `<article class="course-card">
      <span class="tag">${this.escaparHtml(curso.categoria || 'Sem categoria')}</span>
      <h3>${this.escaparHtml(curso.titulo)}</h3>
      <p>${this.escaparHtml(curso.descricao || 'Curso disponivel na plataforma.')}</p>
      <div class="course-meta"><span>Nivel: <strong>${this.escaparHtml(curso.nivel)}</strong></span><span>${curso.totalHoras}h</span><span>${curso.totalMatriculados} aluno(s)</span></div>
      <div class="course-actions">${button}<button class="btn-secondary" data-action="detalhes" data-id="${curso.idCurso}" type="button">Ver detalhes</button>${curso.matriculado ? `<button class="btn-secondary" data-action="certificado" data-id="${curso.idCurso}" type="button">Certificado</button><button class="btn-secondary" data-action="avaliar" data-id="${curso.idCurso}" type="button">Avaliar</button>` : ''}</div>
    </article>`;
  }

  async handleCourseAction(event) {
    const button = event.target.closest('[data-action][data-id]');
    if (!button) return;
    const id = Number(button.dataset.id);

    try {
      if (button.dataset.action === 'matricular') {
        await service.matricularCurso(id);
        this.mostrarMensagem(this.appFeedback, 'Matricula realizada com sucesso.', 'success');
        await this.carregarCursos();
      } else if (button.dataset.action === 'certificado') {
        await service.emitirCertificado(id);
        this.mostrarMensagem(this.appFeedback, 'Certificado emitido. Consulte a aba Minhas matriculas.', 'success');
      } else if (button.dataset.action === 'avaliar') {
        const nota = Number(window.prompt('Informe uma nota de 1 a 5:'));
        if (!nota) return;
        const comentario = window.prompt('Comentario (opcional):') || '';
        await service.avaliarCurso(id, { nota, comentario });
        this.mostrarMensagem(this.appFeedback, 'Avaliacao registrada.', 'success');
      } else if (button.dataset.action === 'detalhes') {
        const curso = await service.getCurso(id);
        this.renderDetalheCurso(curso);
        this.mostrarMensagem(this.appFeedback, `Detalhes de ${curso.titulo} carregados.`, 'success');
      }
    } catch (error) {
      this.mostrarMensagem(this.appFeedback, error.message, 'error');
    }
  }

  renderDetalheCurso(curso) {
    const modulos = curso.modulos?.length
      ? curso.modulos.map((modulo) => `<article class="simple-card"><h3>${this.escaparHtml(modulo.titulo)}</h3><ol>${(modulo.aulas || []).map((aula) => `<li>${this.escaparHtml(aula.titulo)} <span class="small muted">(${aula.duracaoMinutos} min)</span> <button class="btn-secondary" data-action="progresso" data-id="${aula.idAula}" type="button">Marcar concluida</button></li>`).join('') || '<li class="muted">Nenhuma aula cadastrada.</li>'}</ol><form class="form-grid" data-detail-action="aula" data-module-id="${modulo.idModulo}"><div><label>Titulo da aula</label><input name="titulo" required /></div><div><label>Tipo</label><input name="tipoConteudo" value="video" required /></div><div><label>URL</label><input name="urlConteudo" value="https://exemplo.com/aula" required /></div><div><label>Duracao (min)</label><input name="duracaoMinutos" type="number" min="1" value="10" required /></div><div><label>Ordem</label><input name="ordem" type="number" min="1" value="${(modulo.aulas || []).length + 1}" required /></div><div class="form-actions"><button class="btn-secondary" type="submit">Adicionar aula</button></div></form></article>`).join('')
      : '<div class="empty">Nenhum modulo cadastrado.</div>';
    const detail = document.getElementById('course-detail');
    detail.hidden = false;
    detail.innerHTML = `<div class="view-head"><div><h3>${this.escaparHtml(curso.titulo)}</h3><p>${this.escaparHtml(curso.descricao || '')}</p></div><button class="btn-secondary" data-action="fechar-detalhes" type="button">Fechar</button></div><div class="section-form"><h3>Adicionar modulo</h3><form class="form-grid" data-detail-action="modulo" data-course-id="${curso.idCurso}"><div><label>Titulo do modulo</label><input name="titulo" required /></div><div><label>Ordem</label><input name="ordem" type="number" min="1" value="${(curso.modulos || []).length + 1}" required /></div><div class="form-actions"><button class="btn-primary" type="submit">Adicionar modulo</button></div></form></div><div class="cards">${modulos}</div>`;
  }

  async handleCourseDetailAction(event) {
    const button = event.target.closest('[data-action]');
    const form = event.target.closest('form[data-detail-action]');
    try {
      if (button?.dataset.action === 'fechar-detalhes') {
        document.getElementById('course-detail').hidden = true;
        return;
      }
      if (button?.dataset.action === 'progresso') {
        await service.updateProgresso(Number(button.dataset.id), 'concluido');
        this.mostrarMensagem(this.appFeedback, 'Progresso atualizado.', 'success');
        return;
      }
      if (!form) return;
      const dados = Object.fromEntries(new FormData(form));
      if (form.dataset.detailAction === 'modulo') {
        await service.createModulo(Number(form.dataset.courseId), { titulo: dados.titulo, ordem: Number(dados.ordem) });
        this.mostrarMensagem(this.appFeedback, 'Modulo adicionado.', 'success');
        const curso = await service.getCurso(Number(form.dataset.courseId));
        this.renderDetalheCurso(curso);
      } else {
        await service.createAula(Number(form.dataset.moduleId), { titulo: dados.titulo, tipoConteudo: dados.tipoConteudo, urlConteudo: dados.urlConteudo, duracaoMinutos: Number(dados.duracaoMinutos), ordem: Number(dados.ordem) });
        this.mostrarMensagem(this.appFeedback, 'Aula adicionada.', 'success');
        const courseId = document.querySelector('form[data-detail-action="modulo"]')?.dataset.courseId;
        if (courseId) this.renderDetalheCurso(await service.getCurso(Number(courseId)));
      }
    } catch (error) { this.mostrarMensagem(this.appFeedback, error.message, 'error'); }
  }

  async criarCurso() {
    const dados = Object.fromEntries(new FormData(document.getElementById('form-curso')));
    dados.totalHoras = Number(dados.totalHoras);
    try {
      await service.createCurso(dados);
      document.getElementById('form-curso').reset();
      this.mostrarMensagem(this.appFeedback, 'Curso publicado com sucesso.', 'success');
      await this.carregarCursos();
    } catch (error) { this.mostrarMensagem(this.appFeedback, error.message, 'error'); }
  }

  async carregarMatriculas() {
    const requestId = ++this.matriculasRequestId;
    const button = document.getElementById('btn-recarregar-matriculas');
    const status = document.getElementById('matriculas-status');
    button.disabled = true;
    button.textContent = 'Atualizando...';
    status.textContent = 'Buscando seus dados...';
    this.mostrarMensagem(this.appFeedback, 'Atualizando matriculas...', 'success');
    try {
      const [matriculas, progresso, certificados] = await Promise.all([
        service.getMinhasMatriculas(), service.getProgresso(), service.getCertificados(),
      ]);
      if (requestId !== this.matriculasRequestId) return;
      const lista = document.getElementById('lista-matriculas');
      lista.innerHTML = matriculas.length ? matriculas.map((item) => `<article class="simple-card"><span class="tag">${this.escaparHtml(item.curso.categoria || 'Curso')}</span><h3>${this.escaparHtml(item.curso.titulo)}</h3><p>${this.escaparHtml(item.curso.descricao || '')}</p><p class="small">Matricula em ${new Date(item.dataMatricula).toLocaleDateString('pt-BR')}</p></article>`).join('') : '<div class="empty">Voce ainda nao possui matriculas.</div>';
      document.getElementById('lista-progresso').innerHTML = progresso.length ? `<table><thead><tr><th>Aula</th><th>Curso</th><th>Status</th><th>Data</th></tr></thead><tbody>${progresso.map((item) => `<tr><td>${this.escaparHtml(item.aula.titulo)}</td><td>${this.escaparHtml(item.aula.modulo.curso.titulo)}</td><td>${this.escaparHtml(item.status)}</td><td>${new Date(item.dataConclusao).toLocaleDateString('pt-BR')}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">Nenhum progresso registrado.</p>';
      document.getElementById('lista-certificados').innerHTML = certificados.length ? `<table><thead><tr><th>Curso</th><th>Codigo</th><th>Emissao</th></tr></thead><tbody>${certificados.map((item) => `<tr><td>${this.escaparHtml(item.curso.titulo)}</td><td>${this.escaparHtml(item.codigoVerificacao)}</td><td>${new Date(item.dataEmissao).toLocaleDateString('pt-BR')}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">Nenhum certificado emitido.</p>';
      status.textContent = `Atualizado as ${new Date().toLocaleTimeString('pt-BR')}`;
      this.mostrarMensagem(this.appFeedback, 'Matriculas atualizadas com sucesso.', 'success');
    } catch (error) {
      status.textContent = 'Nao foi possivel atualizar';
      this.mostrarMensagem(this.appFeedback, error.message, 'error');
    } finally {
      if (requestId === this.matriculasRequestId) {
        button.disabled = false;
        button.textContent = 'Atualizar';
      }
    }
  }

  async carregarTrilhas() {
    const requestId = ++this.trilhasRequestId;
    const button = document.getElementById('btn-recarregar-trilhas');
    const status = document.getElementById('trilhas-status');
    button.disabled = true;
    button.textContent = 'Atualizando...';
    status.textContent = 'Carregando categorias...';
    try {
      const [trilhas, categorias] = await Promise.all([service.getTrilhas(), service.getCategorias()]);
      if (requestId !== this.trilhasRequestId) return;
      this.categorias = categorias;
      const categoriaSelect = document.getElementById('trilha-categoria');
      categoriaSelect.innerHTML = categorias.length
        ? categorias.map((categoria) => `<option value="${categoria.idCategoria}">${this.escaparHtml(categoria.nome)} (ID ${categoria.idCategoria})</option>`).join('')
        : '<option value="">Nenhuma categoria cadastrada</option>';
      categoriaSelect.disabled = !categorias.length;
      document.getElementById('btn-criar-trilha').disabled = !categorias.length;
      document.getElementById('lista-trilhas').innerHTML = trilhas.length ? trilhas.map((trilha) => `<article class="simple-card"><span class="tag">${this.escaparHtml(trilha.categoria?.nome || 'Trilha')}</span><h3>${this.escaparHtml(trilha.titulo)}</h3><p>${this.escaparHtml(trilha.descricao || 'Trilha de aprendizagem')}</p><p class="small">${trilha._count?.trilhasCursos || 0} curso(s)</p><div class="course-actions"><button class="btn-secondary" data-action="vincular-curso" data-id="${trilha.idTrilha}" type="button">Adicionar curso</button></div></article>`).join('') : '<div class="empty">Nenhuma trilha cadastrada. Crie uma pelo Swagger para ela aparecer aqui.</div>';
      status.textContent = `${categorias.length} categoria(s) disponivel(is) - atualizado as ${new Date().toLocaleTimeString('pt-BR')}`;
    } catch (error) {
      status.textContent = 'Nao foi possivel carregar categorias';
      this.mostrarMensagem(this.appFeedback, error.message, 'error');
    } finally {
      if (requestId === this.trilhasRequestId) {
        button.disabled = false;
        button.textContent = 'Atualizar';
      }
    }
  }

  async criarCategoria() {
    const form = document.getElementById('form-categoria');
    const dados = Object.fromEntries(new FormData(form));
    try {
      await service.criarCategoria(dados);
      form.reset();
      this.mostrarMensagem(this.appFeedback, 'Categoria criada. Ela ja aparece na selecao de trilhas.', 'success');
      await this.carregarTrilhas();
    } catch (error) { this.mostrarMensagem(this.appFeedback, error.message, 'error'); }
  }

  async criarTrilha() {
    const dados = Object.fromEntries(new FormData(document.getElementById('form-trilha')));
    dados.idCategoria = Number(dados.idCategoria);
    try {
      await service.criarTrilha(dados);
      document.getElementById('form-trilha').reset();
      this.mostrarMensagem(this.appFeedback, 'Trilha criada com sucesso.', 'success');
      await this.carregarTrilhas();
    } catch (error) { this.mostrarMensagem(this.appFeedback, error.message, 'error'); }
  }

  async handleTrailAction(event) {
    const button = event.target.closest('[data-action="vincular-curso"]');
    if (!button) return;
    const idCurso = Number(window.prompt('Informe o ID do curso para adicionar:'));
    if (!idCurso) return;
    try {
      await service.linkTrilhaCurso(Number(button.dataset.id), { idCurso, ordem: 1 });
      this.mostrarMensagem(this.appFeedback, 'Curso vinculado a trilha.', 'success');
      await this.carregarTrilhas();
    } catch (error) { this.mostrarMensagem(this.appFeedback, error.message, 'error'); }
  }

  async carregarAssinaturas() {
    const requestId = ++this.assinaturasRequestId;
    const button = document.getElementById('btn-recarregar-assinaturas');
    const status = document.getElementById('assinaturas-status');
    button.disabled = true;
    button.textContent = 'Atualizando...';
    status.textContent = 'Sincronizando planos...';
    try {
      const [planos, assinaturas, pagamentos] = await Promise.all([service.getPlanos(), service.getAssinaturas(), service.getPagamentos()]);
      if (requestId !== this.assinaturasRequestId) return;
      this.assinaturas = assinaturas;
      document.getElementById('lista-planos').innerHTML = planos.length ? planos.map((plano) => `<article class="simple-card"><h3>${this.escaparHtml(plano.nome)}</h3><p>${this.escaparHtml(plano.descricao || 'Plano de acesso')}</p><div class="course-meta"><strong>R$ ${Number(plano.preco).toFixed(2)}</strong><span>${plano.duracaoMeses} mes(es)</span></div><div class="course-actions"><button class="btn-primary" data-action="assinar" data-id="${plano.idPlano}" data-meses="${plano.duracaoMeses}" type="button">Assinar</button></div></article>`).join('') : '<div class="empty">Nenhum plano cadastrado.</div>';
      const pagamentoSelect = document.getElementById('pagamento-assinatura');
      const assinaturaSelecionada = pagamentoSelect.value;
      pagamentoSelect.innerHTML = assinaturas.length
        ? assinaturas.map((item) => `<option value="${item.idAssinatura}">${this.escaparHtml(item.plano.nome)} - ${new Date(item.dataFim).toLocaleDateString('pt-BR')} (ID ${item.idAssinatura})</option>`).join('')
        : '<option value="">Nenhuma assinatura disponivel</option>';
      if (assinaturas.some((item) => String(item.idAssinatura) === assinaturaSelecionada)) pagamentoSelect.value = assinaturaSelecionada;
      document.getElementById('btn-registrar-pagamento').disabled = !assinaturas.length;
      document.getElementById('lista-assinaturas').innerHTML = assinaturas.length ? `<table><thead><tr><th>Plano</th><th>Inicio</th><th>Fim</th><th>Acoes</th></tr></thead><tbody>${assinaturas.map((item) => `<tr><td>${this.escaparHtml(item.plano.nome)}</td><td>${new Date(item.dataInicio).toLocaleDateString('pt-BR')}</td><td>${new Date(item.dataFim).toLocaleDateString('pt-BR')}</td><td><button class="btn-secondary" data-action="pagar" data-id="${item.idAssinatura}" data-valor="${item.plano.preco}" type="button">Registrar pagamento</button></td></tr>`).join('')}</tbody></table>` : '<p class="muted">Nenhuma assinatura ativa.</p>';
      document.getElementById('lista-pagamentos').innerHTML = pagamentos.length ? `<table><thead><tr><th>Transacao</th><th>Valor</th><th>Metodo</th><th>Data</th></tr></thead><tbody>${pagamentos.map((item) => `<tr><td>${this.escaparHtml(item.idTransacaoGateway)}</td><td>R$ ${Number(item.valorPago).toFixed(2)}</td><td>${this.escaparHtml(item.metodoPagamento)}</td><td>${new Date(item.dataPagamento).toLocaleDateString('pt-BR')}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">Nenhum pagamento registrado.</p>';
      status.textContent = `${assinaturas.length} assinatura(s) disponivel(is) - atualizado as ${new Date().toLocaleTimeString('pt-BR')}`;
    } catch (error) {
      status.textContent = 'Nao foi possivel atualizar assinaturas';
      this.mostrarMensagem(this.appFeedback, error.message, 'error');
    } finally {
      if (requestId === this.assinaturasRequestId) {
        button.disabled = false;
        button.textContent = 'Atualizar';
      }
    }
  }

  async handlePlanAction(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    try {
      if (button.dataset.action === 'assinar') {
        const inicio = new Date();
        const fim = new Date(inicio);
        fim.setMonth(fim.getMonth() + Number(button.dataset.meses));
        await service.criarAssinatura({ idPlano: Number(button.dataset.id), dataInicio: inicio.toISOString(), dataFim: fim.toISOString() });
        this.mostrarMensagem(this.appFeedback, 'Assinatura criada com sucesso.', 'success');
      } else if (button.dataset.action === 'pagar') {
        const select = document.getElementById('pagamento-assinatura');
        if (!select.querySelector(`option[value="${button.dataset.id}"]`)) await this.carregarAssinaturas();
        select.value = button.dataset.id;
        document.getElementById('pagamento-valor').value = button.dataset.valor || '';
        document.getElementById('form-pagamento').scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById('pagamento-transacao').focus();
        this.mostrarMensagem(this.appFeedback, 'Confira os dados e confirme o pagamento.', 'success');
        return;
      }
      await this.carregarAssinaturas();
    } catch (error) { this.mostrarMensagem(this.appFeedback, error.message, 'error'); }
  }

  async criarPagamento() {
    const form = document.getElementById('form-pagamento');
    const dados = Object.fromEntries(new FormData(form));
    const idAssinatura = Number(dados.idAssinatura);
    const assinatura = this.assinaturas.find((item) => item.idAssinatura === idAssinatura);
    if (!assinatura) {
      this.mostrarMensagem(this.appFeedback, 'Selecione uma assinatura valida.', 'error');
      return;
    }

    dados.idAssinatura = idAssinatura;
    dados.valorPago = Number(dados.valorPago);
    dados.dataFim = assinatura.dataFim;
    try {
      await service.criarPagamento(dados);
      form.reset();
      this.mostrarMensagem(this.appFeedback, 'Pagamento registrado com sucesso.', 'success');
      await this.carregarAssinaturas();
    } catch (error) { this.mostrarMensagem(this.appFeedback, error.message, 'error'); }
  }

  async criarPlano() {
    const dados = Object.fromEntries(new FormData(document.getElementById('form-plano')));
    dados.preco = Number(dados.preco);
    dados.duracaoMeses = Number(dados.duracaoMeses);
    try {
      await service.criarPlano(dados);
      document.getElementById('form-plano').reset();
      this.mostrarMensagem(this.appFeedback, 'Plano criado com sucesso.', 'success');
      await this.carregarAssinaturas();
    } catch (error) { this.mostrarMensagem(this.appFeedback, error.message, 'error'); }
  }

  async carregarContatos() {
    try {
      this.contatos = await service.getContatos();
      this.renderContatos();
    } catch (error) { this.mostrarMensagem(this.contatoFeedback, error.message, 'error'); }
  }

  async salvarContato() {
    const dados = Object.fromEntries(new FormData(document.getElementById('form-contato')));
    try {
      if (this.editandoId) await service.updateContato(this.editandoId, dados);
      else await service.saveContato(dados);
      this.mostrarMensagem(this.contatoFeedback, this.editandoId ? 'Contato atualizado.' : 'Contato adicionado.', 'success');
      this.cancelarEdicao();
      await this.carregarContatos();
    } catch (error) { this.mostrarMensagem(this.contatoFeedback, error.message, 'error'); }
  }

  async handleContactAction(event) {
    const button = event.target.closest('[data-action][data-id]');
    if (!button) return;
    const id = Number(button.dataset.id);
    const contato = this.contatos.find((item) => item.id === id);
    if (!contato) return;
    if (button.dataset.action === 'editar') {
      this.editandoId = id;
      document.getElementById('nome').value = contato.nome;
      document.getElementById('telefone').value = contato.telefone;
      document.getElementById('email').value = contato.email;
      document.getElementById('btn-salvar').textContent = 'Atualizar contato';
      document.getElementById('btn-cancelar').hidden = false;
    } else if (button.dataset.action === 'remover') {
      if (!window.confirm('Deseja remover este contato?')) return;
      try { await service.deleteContato(id); await this.carregarContatos(); } catch (error) { this.mostrarMensagem(this.contatoFeedback, error.message, 'error'); }
    }
  }

  renderContatos() {
    const lista = document.getElementById('lista-contatos');
    lista.innerHTML = this.contatos.length ? this.contatos.map((contato) => `<tr><td>${this.escaparHtml(contato.nome)}</td><td>${this.escaparHtml(contato.telefone)}</td><td>${this.escaparHtml(contato.email)}</td><td><button class="btn-secondary" data-action="editar" data-id="${contato.id}" type="button">Editar</button> <button class="btn-danger" data-action="remover" data-id="${contato.id}" type="button">Remover</button></td></tr>`).join('') : '<tr><td colspan="4" class="muted">Nenhum contato cadastrado.</td></tr>';
  }

  cancelarEdicao() {
    this.editandoId = null;
    document.getElementById('form-contato').reset();
    document.getElementById('btn-salvar').textContent = 'Salvar contato';
    document.getElementById('btn-cancelar').hidden = true;
  }

  alternarAuthMode() {
    this.authMode = this.authMode === 'login' ? 'register' : 'login';
    const register = this.authMode === 'register';
    document.getElementById('auth-titulo').textContent = register ? 'Criar conta' : 'Entrar na plataforma';
    document.getElementById('auth-descricao').textContent = register ? 'Crie seu acesso para usar todos os recursos.' : 'Use seu e-mail e senha para continuar.';
    document.getElementById('campo-nome').hidden = !register;
    document.getElementById('auth-nome').required = register;
    document.getElementById('btn-auth').textContent = register ? 'Criar conta' : 'Entrar';
    document.getElementById('btn-alternar-auth').textContent = register ? 'Entrar' : 'Criar conta';
    this.authForm.reset();
    this.ocultarMensagem(this.authFeedback);
  }

  mostrarApp(usuario) {
    this.authView.hidden = true;
    this.appView.hidden = false;
    document.getElementById('usuario-nome').textContent = usuario?.name || 'Usuario autenticado';
    document.getElementById('usuario-email').textContent = usuario?.email || '';
    void this.mostrarView('cursos');
  }

  mostrarAuth() { this.authView.hidden = false; this.appView.hidden = true; }

  sair() { service.clearSession(); this.mostrarAuth(); }

  mostrarMensagem(elemento, mensagem, tipo) { elemento.textContent = mensagem; elemento.className = `feedback visible ${tipo}`; }
  ocultarMensagem(elemento) { elemento.textContent = ''; elemento.className = 'feedback'; }
  escaparHtml(texto) { return String(texto ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&39;'); }
}
