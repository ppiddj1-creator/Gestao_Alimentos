// database.js — Versão LOCAL (localStorage)
// Para deploy, trocar por database-firebase.js e configurar firebase-config.js

const Database = {
  _carregar(nomeColecao) {
    const dados = localStorage.getItem("colecao_" + nomeColecao);
    return dados ? JSON.parse(dados) : [];
  },

  _salvar(nomeColecao, itens) {
    localStorage.setItem("colecao_" + nomeColecao, JSON.stringify(itens));
  },

  async getColecao(nomeColecao) {
    return this._carregar(nomeColecao);
  },

  async getDocumento(nomeColecao, id) {
    const itens = this._carregar(nomeColecao);
    return itens.find((item) => item.id === id) || null;
  },

  async adicionar(nomeColecao, dados, idPersonalizado) {
    const itens = this._carregar(nomeColecao);
    const id = idPersonalizado || this._gerarId();
    const novoItem = { id, ...dados };
    itens.push(novoItem);
    this._salvar(nomeColecao, itens);
    return id;
  },

  async atualizar(nomeColecao, id, dados) {
    const itens = this._carregar(nomeColecao);
    const index = itens.findIndex((item) => item.id === id);
    if (index === -1) throw new Error(`Documento ${id} não encontrado em ${nomeColecao}`);
    itens[index] = { ...itens[index], ...dados };
    this._salvar(nomeColecao, itens);
  },

  async excluir(nomeColecao, id) {
    let itens = this._carregar(nomeColecao);
    itens = itens.filter((item) => item.id !== id);
    this._salvar(nomeColecao, itens);
  },

  async buscarPorCampo(nomeColecao, campo, valor) {
    const itens = this._carregar(nomeColecao);
    return itens.filter((item) => item[campo] === valor);
  },

  async buscarPorOrdem(nomeColecao, campo) {
    const itens = this._carregar(nomeColecao);
    return itens.sort((a, b) => {
      if (a[campo] < b[campo]) return -1;
      if (a[campo] > b[campo]) return 1;
      return 0;
    });
  },

  _gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  }
};
