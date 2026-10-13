// relatorio.js — Gráficos + Relatórios (só almoço)

const Relatorio = {
  graficoBarras: null,

  async carregar() {
    const pessoas = await Database.getColecao("pessoas");
    const registros = await Database.getColecao("registros");

    this._renderizarAproveitamento(pessoas, registros);
    this._renderizarGraficoBarras(registros);
    this._renderizarHistorico(registros);
  },

  // Filtro único: aplica período + turma/categoria no gráfico, aproveitamento e histórico
  async filtrar() {
    const inicio = document.getElementById("filtro-inicio").value;
    const fim = document.getElementById("filtro-fim").value;
    const turma = document.getElementById("filtro-turma").value;
    const categoria = document.getElementById("filtro-categoria").value;

    const pessoas = await Database.getColecao("pessoas");
    const pessoasMap = {};
    pessoas.forEach((p) => {
      pessoasMap[p.id] = p;
    });

    const pessoasFiltradas = pessoas.filter((p) => {
      if (turma && (p.turmaSetor || "").trim() !== turma) return false;
      if (categoria && p.categoria !== categoria) return false;
      return true;
    });

    let registros = await Database.getColecao("registros");
    registros = registros.filter((r) => {
      if (inicio && r.data < inicio) return false;
      if (fim && r.data > fim) return false;
      const pessoa = pessoasMap[r.pessoaId];
      if (turma && (!pessoa || (pessoa.turmaSetor || "").trim() !== turma)) return false;
      if (categoria && (!pessoa || pessoa.categoria !== categoria)) return false;
      return true;
    });

    this._renderizarAproveitamento(pessoasFiltradas, registros);
    this._renderizarGraficoBarras(registros);
    this._renderizarHistorico(registros);
  },

  limparFiltros() {
    document.getElementById("filtro-inicio").value = "";
    document.getElementById("filtro-fim").value = "";
    document.getElementById("filtro-turma").value = "";
    document.getElementById("filtro-categoria").value = "";
    this.carregar();
    if (typeof RelatorioExtra !== "undefined") RelatorioExtra._renderizarPizza();
  },

  _renderizarAproveitamento(pessoas, registros) {
    const total = pessoas.length;
    if (total === 0) {
      document.getElementById("tabela-aproveitamento").innerHTML = "<p>Nenhuma pessoa cadastrada.</p>";
      return;
    }

    const porData = {};
    registros.forEach((r) => {
      if (!porData[r.data]) porData[r.data] = { sim: 0, nao: 0 };
      if (r.vaiAlmocar === true) porData[r.data].sim++;
      else if (r.vaiAlmocar === false) porData[r.data].nao++;
    });

    const datas = Object.keys(porData);
    const diasComDados = datas.length || 1;

    let totalSim = 0;
    let totalNao = 0;
    datas.forEach((d) => {
      totalSim += porData[d].sim;
      totalNao += porData[d].nao;
    });

    const totalRespondidos = totalSim + totalNao;
    const totalEsperado = total * diasComDados;
    const mediaDiaria = (totalSim / diasComDados).toFixed(1);
    const pctCapacidade = totalEsperado > 0 ? ((totalSim / totalEsperado) * 100).toFixed(1) : "0.0";
    const pctPendentes =
      totalEsperado > 0 ? (((totalEsperado - totalRespondidos) / totalEsperado) * 100).toFixed(1) : "0.0";
    const totalPendentes = Math.max(0, totalEsperado - totalRespondidos);

    let html = '<table class="tabela"><thead><tr><th>Métrica</th><th>Valor</th></tr></thead><tbody>';
    html += "<tr><td>Dias com registros no período</td><td>" + datas.length + "</td></tr>";
    html += "<tr><td>Total de confirmações (SIM)</td><td>" + totalSim + "</td></tr>";
    html += "<tr><td>Total de recusas (NÃO)</td><td>" + totalNao + "</td></tr>";
    html += "<tr><td>Pendentes (sem resposta)</td><td>" + totalPendentes + " (" + pctPendentes + "%)</td></tr>";
    html += "<tr><td>Média diária de quem almoça</td><td>" + mediaDiaria + "</td></tr>";
    html += "<tr><td>% da capacidade utilizada</td><td>" + pctCapacidade + "%</td></tr>";
    html += "</tbody></table>";
    document.getElementById("tabela-aproveitamento").innerHTML = html;
  },

  _renderizarGraficoBarras(registros) {
    let datas = [...new Set(registros.map((r) => r.data))].sort();

    if (datas.length === 0) {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        datas.push(d.toISOString().split("T")[0]);
      }
    }
    if (datas.length > 31) datas = datas.slice(-31);

    const labels = datas.map((d) => {
      const parts = d.split("-");
      return parts[2] + "/" + parts[1];
    });

    const dadosSim = [];
    const dadosNao = [];

    datas.forEach((data) => {
      const regsDia = registros.filter((r) => r.data === data);
      dadosSim.push(regsDia.filter((r) => r.vaiAlmocar === true).length);
      dadosNao.push(regsDia.filter((r) => r.vaiAlmocar === false).length);
    });

    if (this.graficoBarras) this.graficoBarras.destroy();

    const ctx = document.getElementById("grafico-barras").getContext("2d");
    this.graficoBarras = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Sim (vai almoçar)", data: dadosSim, backgroundColor: "#66bb6a", borderRadius: 6 },
          { label: "Não", data: dadosNao, backgroundColor: "#ef5350", borderRadius: 6 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
      }
    });
  },

  _renderizarHistorico(registros) {
    if (typeof RelatorioExtra !== "undefined") {
      RelatorioExtra._renderizarHistorico(registros);
    }
  }
};

(function () {
  if (!Auth.verificarAcesso([])) return;
  const usuario = Auth.getUsuarioLogado();
  document.getElementById("usuario-nome").textContent = usuario.nome;
  Relatorio.carregar();
})();
