const API_URL = (globalThis.APP_CONFIG?.API_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const TOKEN_KEY = 'agenda_access_token';
const USER_KEY = 'agenda_user';

// Erro da API com o status HTTP, para o controller escolher a mensagem certa (401, 403, 409...).
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export class AgendaService {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUser() {
    const user = localStorage.getItem(USER_KEY);

    try {
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  setSession(session) {
    localStorage.setItem(TOKEN_KEY, session.access_token);
    this.setUser(session.user);
  }

  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  register(dados) {
    return this.#request('/auth/register', { method: 'POST', body: dados });
  }

  login(dados) {
    return this.#request('/auth/login', { method: 'POST', body: dados });
  }

  loginAdmin(dados) {
    return this.#request('/auth/admin/login', { method: 'POST', body: dados });
  }

  me() {
    return this.#request('/auth/me');
  }

  getContatos() {
    return this.#request('/contatos');
  }

  saveContato(dadosContato) {
    return this.#request('/contatos', { method: 'POST', body: dadosContato });
  }

  updateContato(id, dadosContato) {
    return this.#request(`/contatos/${id}`, { method: 'PATCH', body: dadosContato });
  }

  deleteContato(id) {
    return this.#request(`/contatos/${id}`, { method: 'DELETE' });
  }

  getCursos() {
    return this.#request('/cursos');
  }

  getCurso(id) {
    return this.#request(`/cursos/${id}`);
  }

  createCurso(dados) {
    return this.#request('/cursos', { method: 'POST', body: dados });
  }

  matricularCurso(id) {
    return this.#request(`/cursos/${id}/matricular`, { method: 'POST' });
  }

  getMinhasMatriculas() {
    return this.#request('/cursos/matriculados');
  }

  getCategorias() {
    return this.#request('/categorias');
  }

  criarCategoria(dados) {
    return this.#request('/categorias', { method: 'POST', body: dados });
  }

  getTrilhas() {
    return this.#request('/trilhas');
  }

  getCertificados() {
    return this.#request('/certificados');
  }

  getPlanos() {
    return this.#request('/planos');
  }

  getAssinaturas() {
    return this.#request('/assinaturas');
  }

  getPagamentos() {
    return this.#request('/pagamentos');
  }

  getProgresso() {
    return this.#request('/progresso');
  }

  getMatriculas() {
    return this.#request('/matriculas');
  }

  createModulo(idCurso, dados) {
    return this.#request(`/cursos/${idCurso}/modulos`, { method: 'POST', body: dados });
  }

  createAula(idModulo, dados) {
    return this.#request(`/modulos/${idModulo}/aulas`, { method: 'POST', body: dados });
  }

  linkTrilhaCurso(idTrilha, dados) {
    return this.#request(`/trilhas/${idTrilha}/cursos`, { method: 'POST', body: dados });
  }

  updateProgresso(idAula, status) {
    return this.#request(`/aulas/${idAula}/progresso`, { method: 'PUT', body: { status } });
  }

  avaliarCurso(idCurso, dados) {
    return this.#request(`/cursos/${idCurso}/avaliacoes`, { method: 'POST', body: dados });
  }

  emitirCertificado(idCurso) {
    return this.#request(`/cursos/${idCurso}/certificado`, { method: 'POST' });
  }

  criarTrilha(dados) {
    return this.#request('/trilhas', { method: 'POST', body: dados });
  }

  criarPlano(dados) {
    return this.#request('/planos', { method: 'POST', body: dados });
  }

  criarAssinatura(dados) {
    return this.#request('/assinaturas', { method: 'POST', body: dados });
  }

  criarPagamento(dados) {
    return this.#request('/pagamentos', { method: 'POST', body: dados });
  }

  async #request(path, options = {}) {
    const headers = { Accept: 'application/json', ...(options.headers ?? {}) };
    const token = this.getToken();

    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    const responseText = await response.text();
    const responseData = responseText ? JSON.parse(responseText) : null;

    if (!response.ok) {
      const message = Array.isArray(responseData?.message)
        ? responseData.message.join(' ')
        : responseData?.message;
      throw new ApiError(response.status, message || 'Não foi possível concluir a solicitação.');
    }

    return responseData;
  }
}
