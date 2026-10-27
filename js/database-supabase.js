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

  // Insere vários registros em uma única requisição (uma linha falha => lote inteiro falha)
  async adicionarLote(nomeColecao, registros) {
    await this._aguardarSeed();
    if (!registros || registros.length === 0) return 0;
    const linhas = registros.map((r) => (r.id ? r : { id: this._gerarId(), ...r }));
    const { error } = await sb.from(nomeColecao).insert(linhas);
    if (error) throw error;
    return linhas.length;
  },

  // Seleciona só algumas colunas, paginando quando houver mais de 1000 linhas
  async listarCampos(nomeColecao, campos) {
    await this._aguardarSeed();
    const resultado = [];
    const TAM = 1000;
    let inicio = 0;
    for (;;) {
      const { data, error } = await sb
        .from(nomeColecao)
        .select(campos.join(","))
        .range(inicio, inicio + TAM - 1);
      if (error) throw error;
      resultado.push(...(data || []));
      if (!data || data.length < TAM) break;
      inicio += TAM;
    }
    return resultado;
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

  // Exclui todos os registros de uma coleção em uma única requisição
  async excluirTodos(nomeColecao) {
    await this._aguardarSeed();
    const { error } = await sb.from(nomeColecao).delete().neq("id", "__todos__");
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
  },

  // Converte erros do Supabase/rede em mensagem entendível
  erroAmigavel(erro) {
    const msg = String((erro && erro.message) || erro || "").toLowerCase();
    if (
      msg.includes("failed to fetch") ||
      msg.includes("networkerror") ||
      msg.includes("load failed") ||
      msg.includes("non-existent domain") ||
      msg.includes("getaddrinfo") ||
      msg.includes("dns")
    ) {
      return "Sem conexão com o banco de dados. Verifique sua internet e se o projeto do Supabase ainda está ativo.";
    }
    if (msg.includes("invalid api key") || msg.includes("401") || msg.includes("unauthorized")) {
      return "Chave de acesso inválida. Confira js/supabase-config.js.";
    }
    if (msg.includes("404") || msg.includes("not found")) {
      return "Tabela não encontrada. Rode as migrations em supabase/migrations no SQL Editor do Supabase.";
    }
    return "Erro: " + ((erro && erro.message) || erro);
  },

  // Mostra o erro na página (no alerta existente ou em um aviso no topo)
  mostrarErro(erro) {
    const texto = this.erroAmigavel(erro);
    console.error("[Supabase]", erro);

    const alerta = document.querySelector(".alerta:not(.oculto)") || document.querySelector("[id^='alerta-']");
    if (alerta && alerta.id) {
      alerta.textContent = texto;
      alerta.className = "alerta alerta-erro";
      alerta.classList.remove("oculto");
    }

    let aviso = document.getElementById("aviso-banco");
    if (!aviso) {
      aviso = document.createElement("div");
      aviso.id = "aviso-banco";
      aviso.className = "alerta alerta-erro";
      aviso.setAttribute("role", "alert");
      const main = document.querySelector("main") || document.body;
      main.prepend(aviso);
    }
    aviso.textContent = texto;
  }
};
