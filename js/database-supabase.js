// database-supabase.js — Camada de banco via Supabase (PostgreSQL)
// API idêntica à database.js (localStorage) — troca transparente.
// Todos os métodos aguardam o seed (DADOS_INICIAIS_PRONTO) antes de ler/escrever.

const Database = {
  async _aguardarSeed() {
    if (window.DADOS_INICIAIS_PRONTO) await window.DADOS_INICIAIS_PRONTO;
  },

  async getColecao(nomeColecao) {
    await this._aguardarSeed();
    const { data, error } = await sb.from(nomeColecao).select("*");
    if (error) throw error;
    return data;
  },

  async getDocumento(nomeColecao, id) {
    await this._aguardarSeed();
    const { data, error } = await sb.from(nomeColecao).select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  },

  async adicionar(nomeColecao, dados, idPersonalizado) {
    await this._aguardarSeed();
    const id = idPersonalizado || this._gerarId();
    const { error } = await sb.from(nomeColecao).insert({ id, ...dados });
    if (error) throw error;
    return id;
  },

  async atualizar(nomeColecao, id, dados) {
    await this._aguardarSeed();
    const { data, error } = await sb.from(nomeColecao).update(dados).eq("id", id).select("id");
    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error(`Documento ${id} não encontrado em ${nomeColecao}`);
    }
  },

  async excluir(nomeColecao, id) {
    await this._aguardarSeed();
    const { error } = await sb.from(nomeColecao).delete().eq("id", id);
    if (error) throw error;
  },

  async buscarPorCampo(nomeColecao, campo, valor) {
    await this._aguardarSeed();
    const { data, error } = await sb.from(nomeColecao).select("*").eq(campo, valor);
    if (error) throw error;
    return data;
  },

  async buscarPorOrdem(nomeColecao, campo) {
    await this._aguardarSeed();
    const { data, error } = await sb
      .from(nomeColecao)
      .select("*")
      .order(campo, { ascending: true });
    if (error) throw error;
    return data;
  },

  _gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  }
};
