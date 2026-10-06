// registro-aluno.js — Lógica do Registro Simplificado do Aluno (SIM/NÃO para o almoço)

const RegistroAluno = {
  async inicializar() {
    const usuario = Auth.getUsuarioLogado();
    const pessoa = await Database.getDocumento("pessoas", usuario.id);

    if (pessoa) {
      document.getElementById("aluno-nome").textContent = "Olá, " + pessoa.nome + "!";
      document.getElementById("aluno-matricula").textContent = "Matrícula: " + pessoa.matricula;
    } else {
      document.getElementById("aluno-nome").textContent = "Olá, " + usuario.nome + "!";
      document.getElementById("aluno-matricula").textContent = "Matrícula: " + usuario.usuario;
    }

    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const dias = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    document.getElementById("aluno-data").textContent =
      "Amanhã: " + dias[amanha.getDay()] + ", " + amanha.getDate() + " de " + meses[amanha.getMonth()] + " de " + amanha.getFullYear();

    await this._carregarCardapio(amanha);
    await this._verificarRegistro(usuario.id, amanha);
  },

  async _carregarCardapio(amanha) {
    const nomes = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
    const diaSemana = nomes[amanha.getDay()];
    const cardapios = await Database.getColecao("cardapio");
    const hoje = cardapios.find((c) => c.id === diaSemana);

    const el = document.getElementById("cardapio-hoje-aluno");
    if (hoje && hoje.prato) {
      el.innerHTML = "🍽️ <strong>Almoço de amanhã:</strong> " + hoje.prato;
    } else {
      el.innerHTML = "🍽️ Cardápio de amanhã ainda não definido.";
    }
  },

  async registrar(opcao) {
    const usuario = Auth.getUsuarioLogado();
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const data = amanha.toISOString().split("T")[0];

    const registros = await Database.buscarPorCampo("registros", "data", data);
    const existente = registros.find((r) => r.pessoaId === usuario.id);

    const dados = {
      data,
      pessoaId: usuario.id,
      vaiAlmocar: opcao,
      registradoPor: "aluno",
      registradoEm: new Date().toISOString()
    };

    if (existente) {
      await Database.atualizar("registros", existente.id, dados);
    } else {
      await Database.adicionar("registros", dados);
    }

    this._atualizarStatus(opcao);
    this._mostrarAlerta(opcao ? "Registro confirmado! Você vai almoçar." : "Registro confirmado! Você não vai almoçar.", opcao ? "sucesso" : "aviso");
  },

  async _verificarRegistro(usuarioId, data) {
    const dataStr = data.toISOString().split("T")[0];
    const registros = await Database.buscarPorCampo("registros", "data", dataStr);
    const registro = registros.find((r) => r.pessoaId === usuarioId);

    if (registro) {
      this._atualizarStatus(registro.vaiAlmocar);
    } else {
      document.getElementById("status-registro").textContent = "Nenhuma opção registrada ainda";
      document.getElementById("status-registro").className = "status-msg pendente";
    }

    const agora = new Date();
    const prazo = new Date(data);
    prazo.setHours(23, 59, 0, 0);

    const horasRestantes = Math.max(0, Math.floor((prazo - agora) / (1000 * 60 * 60)));
    document.getElementById("prazo-info").textContent = "Prazo: até 23h59 de hoje. Faltam " + horasRestantes + " horas.";
  },

  _atualizarStatus(opcao) {
    document.querySelectorAll(".opcao-btn").forEach((btn) => btn.classList.remove("selecionado"));
    if (opcao) {
      document.querySelector(".opcao-btn.sim").classList.add("selecionado");
    } else {
      document.querySelector(".opcao-btn.nao").classList.add("selecionado");
    }

    const el = document.getElementById("status-registro");
    if (opcao) {
      el.textContent = "✓ Você vai almoçar";
      el.className = "status-msg confirmado";
    } else {
      el.textContent = "✗ Você não vai almoçar";
      el.className = "status-msg cancelado";
    }
  },

  _mostrarAlerta(msg, tipo) {
    const alerta = document.getElementById("alerta-aluno");
    alerta.textContent = msg;
    alerta.className = "alerta alerta-" + tipo;
    setTimeout(() => alerta.classList.add("oculto"), 5000);
  }
};

(function () {
  const usuario = Auth.getUsuarioLogado();
  if (!usuario || usuario.perfil !== "aluno") {
    window.location.href = "index.html";
    return;
  }

  RegistroAluno.inicializar();
})();