// registro-aluno.js — Tela simples de resposta SIM/NÃO (alunos, professores e funcionários)

const RegistroAluno = {
  _pessoaId: null,
  _perfil: null,
  _salvando: false,
  _timerAlerta: null,

  async inicializar() {
    const usuario = Auth.getUsuarioLogado();
    this._perfil = usuario.perfil;

    const pessoa = await this._resolverPessoa(usuario);
    // O registro sempre usa o id da PESSOA (mesmo quando o login veio da tabela "usuarios")
    this._pessoaId = pessoa ? pessoa.id : usuario.id;

    const nome = pessoa ? pessoa.nome : usuario.nome;
    document.getElementById("aluno-nome").textContent = "Olá, " + this._primeiroNome(nome) + "!";
    document.getElementById("aluno-avatar").textContent = this._iniciais(nome);

    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    document.getElementById("aluno-data").textContent = this._formatarData(amanha);

    this._atualizarPrazo();
    await this._carregarCardapio(amanha);
    await this._verificarRegistro(this._pessoaId, amanha);

    document.getElementById("form-alterar-senha").addEventListener("submit", (e) => {
      e.preventDefault();
      this.alterarSenha();
    });
  },

  // Login direto na tabela "pessoas" -> id já é o da pessoa.
  // Login criado pelo admin na tabela "usuarios" -> usa o "pessoaId" vinculado.
  async _resolverPessoa(usuario) {
    let pessoa = null;
    try {
      pessoa = await Database.getDocumento("pessoas", usuario.id);
    } catch (erro) {
      console.warn("Não foi possível ler a pessoa:", erro);
    }
    if (pessoa) return pessoa;

    if (usuario.pessoaId) {
      try {
        return await Database.getDocumento("pessoas", usuario.pessoaId);
      } catch (erro) {
        console.warn("Não foi possível ler a pessoa vinculada:", erro);
      }
    }
    return null;
  },

  async _carregarCardapio(amanha) {
    const el = document.getElementById("cardapio-hoje-aluno");
    const nomes = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
    const diaSemana = nomes[amanha.getDay()];

    try {
      const cardapios = await Database.getColecao("cardapio");
      const hoje = cardapios.find((c) => c.id === diaSemana);
      el.textContent = hoje && hoje.prato ? hoje.prato : "Cardápio de amanhã ainda não definido.";
    } catch (erro) {
      console.warn("Não foi possível carregar o cardápio:", erro);
      el.textContent = "Não foi possível carregar o cardápio agora.";
    }
  },

  async registrar(opcao) {
    if (this._salvando) return;

    if (this._prazoEncerrado()) {
      this._atualizarPrazo();
      this._mostrarAlerta("O prazo para responder já encerrou. Não é possível alterar a resposta.", "erro");
      return;
    }

    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const data = amanha.toISOString().split("T")[0];

    this._salvando = true;
    this._defsSalvando(true);

    try {
      const registros = await Database.buscarPorCampo("registros", "data", data);
      const existente = registros.find((r) => r.pessoaId === this._pessoaId);

      const dados = {
        data,
        pessoaId: this._pessoaId,
        vaiAlmocar: opcao,
        registradoPor: this._perfil || "aluno",
        registradoEm: new Date().toISOString()
      };

      if (existente) {
        await Database.atualizar("registros", existente.id, dados);
      } else {
        await Database.adicionar("registros", dados);
      }

      // Só mostra sucesso depois de a resposta ter sido gravada no banco
      this._atualizarStatus(opcao);
      this._mostrarAlerta("Resposta registrada com sucesso!", "sucesso");
    } catch (erro) {
      console.error("Falha ao registrar resposta:", erro);
      this._mostrarAlerta("Não foi possível salvar sua resposta. " + Database.erroAmigavel(erro) + " Tente novamente.", "erro");
    } finally {
      this._salvando = false;
      this._defsSalvando(false);
    }
  },

  async _verificarRegistro(usuarioId, data) {
    const dataStr = data.toISOString().split("T")[0];

    try {
      const registros = await Database.buscarPorCampo("registros", "data", dataStr);
      const registro = registros.find((r) => r.pessoaId === usuarioId);
      if (registro) {
        this._atualizarStatus(registro.vaiAlmocar);
      } else {
        this._limparStatus();
      }
    } catch (erro) {
      console.warn("Não foi possível verificar a resposta anterior:", erro);
      this._limparStatus();
      this._mostrarAlerta("Não foi possível carregar sua resposta anterior. " + Database.erroAmigavel(erro), "erro");
    }
  },

  // Prazo = hoje às 23h59:59 (resposta para o almoço de amanhã)
  _dataPrazo() {
    const prazo = new Date();
    prazo.setHours(23, 59, 59, 999);
    return prazo;
  },

  _prazoEncerrado() {
    return new Date() > this._dataPrazo();
  },

  _atualizarPrazo() {
    const prazo = this._dataPrazo();
    const encerrado = this._prazoEncerrado();
    const dataTexto = this._formatarData(prazo).replace(/^./, (c) => c.toLowerCase());
    const hora = prazo.getHours() + "h" + String(prazo.getMinutes()).padStart(2, "0");

    document.getElementById("prazo-info").textContent = encerrado
      ? "Prazo encerrado: respostas aceitas até " + dataTexto + ", às " + hora + "."
      : "Responda até " + dataTexto + ", às " + hora + ".";

    if (encerrado) this._bloquearBotoes();
  },

  _defsSalvando(ativo) {
    document.querySelectorAll(".opcao-btn").forEach((btn) => {
      btn.disabled = ativo || this._prazoEncerrado();
      btn.classList.toggle("carregando", ativo);
    });
  },

  _bloquearBotoes() {
    document.querySelectorAll(".opcao-btn").forEach((btn) => {
      btn.disabled = true;
      btn.classList.add("desabilitado");
    });
  },

  _atualizarStatus(opcao) {
    const sim = document.querySelector(".opcao-btn.sim");
    const nao = document.querySelector(".opcao-btn.nao");

    sim.classList.toggle("selecionado", opcao === true);
    nao.classList.toggle("selecionado", opcao === false);
    sim.setAttribute("aria-pressed", String(opcao === true));
    nao.setAttribute("aria-pressed", String(opcao === false));

    const el = document.getElementById("status-registro");
    if (opcao) {
      el.textContent = "✓ Você vai almoçar amanhã";
      el.className = "status-msg confirmado";
    } else {
      el.textContent = "✗ Você não vai almoçar amanhã";
      el.className = "status-msg cancelado";
    }
  },

  _limparStatus() {
    const sim = document.querySelector(".opcao-btn.sim");
    const nao = document.querySelector(".opcao-btn.nao");
    sim.classList.remove("selecionado");
    nao.classList.remove("selecionado");
    sim.setAttribute("aria-pressed", "false");
    nao.setAttribute("aria-pressed", "false");

    const el = document.getElementById("status-registro");
    el.textContent = "Você ainda não respondeu";
    el.className = "status-msg pendente";
  },

  _formatarData(data) {
    const dias = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    return dias[data.getDay()] + ", " + data.getDate() + " de " + meses[data.getMonth()] + " de " + data.getFullYear();
  },

  _primeiroNome(nome) {
    const partes = String(nome || "").trim().split(/\s+/).filter(Boolean);
    return partes.length > 0 ? partes[0] : "tudo bem";
  },

  _iniciais(nome) {
    const partes = String(nome || "?").trim().split(/\s+/).filter(Boolean);
    if (!partes.length) return "?";
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  },

  abrirModalSenha() {
    document.getElementById("form-alterar-senha").reset();
    document.getElementById("alerta-senha").className = "alerta oculto";
    document.getElementById("modal-senha").style.display = "flex";
  },

  fecharModalSenha(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById("modal-senha").style.display = "none";
  },

  async alterarSenha() {
    const atual = document.getElementById("s-atual").value;
    const nova = document.getElementById("s-nova").value;
    const confirmacao = document.getElementById("s-confirmar").value;

    try {
      await Auth.alterarSenha(atual, nova, confirmacao);
      document.getElementById("form-alterar-senha").reset();
      this._mostrarAlertaSenha("Senha alterada com sucesso!", "sucesso");
      setTimeout(() => {
        document.getElementById("modal-senha").style.display = "none";
      }, 1200);
    } catch (erro) {
      this._mostrarAlertaSenha(erro.message, "erro");
    }
  },

  _mostrarAlertaSenha(msg, tipo) {
    const alerta = document.getElementById("alerta-senha");
    alerta.textContent = msg;
    alerta.className = "alerta alerta-" + tipo;
    setTimeout(() => alerta.classList.add("oculto"), 5000);
  },

  _mostrarAlerta(msg, tipo) {
    const alerta = document.getElementById("alerta-aluno");
    alerta.textContent = msg;
    alerta.className = "alerta alerta-" + tipo;
    if (this._timerAlerta) clearTimeout(this._timerAlerta);
    this._timerAlerta = setTimeout(() => alerta.classList.add("oculto"), 6000);
  }
};

(function () {
  const usuario = Auth.getUsuarioLogado();
  // Tela de resposta (SIM/NÃO) para alunos, professores e funcionários.
  // O admin não usa esta tela — ele vai direto para o painel.
  if (!usuario || Auth.ehAdmin() || !Auth.RESPOSTA.includes(usuario.perfil)) {
    window.location.href = Auth.redirecionarParaPerfil();
    return;
  }

  RegistroAluno.inicializar();
})();
