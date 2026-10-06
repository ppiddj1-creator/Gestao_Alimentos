// dashboard.js — Lógica do Painel Principal (resultado do almoço)

const Dashboard = {
  async carregar() {
    try {
      const amanha = this._obterDataAmanha();

      const pessoas = await Database.getColecao("pessoas");
      const registros = await Database.buscarPorCampo("registros", "data", amanha);
      const cardapio = await Database.getColecao("cardapio");

      const respondidos = registros.filter((r) => r.vaiAlmocar !== undefined);

      const totalVai = respondidos.filter((r) => r.vaiAlmocar === true).length;
      const totalNao = respondidos.filter((r) => r.vaiAlmocar === false).length;
      const totalPendentes = pessoas.length - respondidos.length;

      document.getElementById("total-vai-almocar").textContent = totalVai;
      document.getElementById("total-nao-vai-almocar").textContent = totalNao;
      document.getElementById("total-pendentes").textContent = totalPendentes;

      const porCategoria = { aluno: 0, professor: 0, funcionario: 0 };
      pessoas.forEach((p) => {
        if (porCategoria[p.categoria] !== undefined) porCategoria[p.categoria]++;
      });

      document.getElementById("totais-cadastrados").innerHTML =
        '<p style="font-size:15px; margin-bottom:6px;"><strong>Alunos:</strong> ' + porCategoria.aluno + '</p>' +
        '<p style="font-size:15px; margin-bottom:6px;"><strong>Professores:</strong> ' + porCategoria.professor + '</p>' +
        '<p style="font-size:15px; margin-bottom:6px;"><strong>Funcionários:</strong> ' + porCategoria.funcionario + '</p>' +
        '<p style="font-size:15px; margin-top:10px; padding-top:8px; border-top:1px solid #eee;"><strong>Total:</strong> ' + pessoas.length + '</p>';

      const diaSemana = this._obterDiaSemana(new Date());
      const cardapioHoje = cardapio.find((c) => c.id === diaSemana);
      if (cardapioHoje && cardapioHoje.prato) {
        document.getElementById("cardapio-hoje").innerHTML =
          '<div class="refeicao-item" style="font-size:15px;">🍽️ <strong>' + cardapioHoje.prato + '</strong></div>';
      } else {
        document.getElementById("cardapio-hoje").innerHTML = '<p style="color:#999;">Cardápio de amanhã ainda não definido.</p>';
      }
    } catch (erro) {
      console.error("Erro ao carregar dashboard:", erro);
    }
  },

  _obterDataAmanha() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  },

  _obterDiaSemana(data) {
    const nomes = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
    return nomes[data.getDay()];
  }
};

(function () {
  const usuario = Auth.getUsuarioLogado();
  if (!usuario) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("usuario-nome").textContent = usuario.nome;

  const dias = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
  const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const hoje = new Date();
  document.getElementById("data-atual").textContent =
    dias[hoje.getDay()] + ", " + hoje.getDate() + " de " + meses[hoje.getMonth()] + " de " + hoje.getFullYear();

  Dashboard.carregar();
})();