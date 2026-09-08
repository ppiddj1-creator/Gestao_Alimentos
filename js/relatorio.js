// relatorio.js — Gráficos + Relatórios (só almoço)

const Relatorio = {
  graficoBarras: null,

  async carregar() {
    const pessoas = await Database.getColecao("pessoas");
    const registros = await Database.getColecao("registros");

    this._renderizarAproveitamento(pessoas, registros);
    await this._renderizarGraficoBarras(registros);
    this._renderizarHistorico(registros);
  },

  async filtrar() {
    const inicio = document.getElementById("filtro-inicio").value;
    const fim = document.getElementById("filtro-fim").value;
    const registros = await Database.getColecao("registros");
    const filtrados = registros.filter((r) => {
      if (inicio && r.data < inicio) return false;
      if (fim && r.data > fim) return false;
      return true;
    });
    this._renderizarHistorico(filtrados);
  },

  _renderizarAproveitamento(pessoas, registros) {
    const total = pessoas.length;
    if (total === 0) {
      document.getElementById("tabela-aproveitamento").innerHTML = "<p>Nenhuma pessoa cadastrada.</p>";
      return;
    }

    const ultimos7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      ultimos7.push(d.toISOString().split("T")[0]);
    }

    let totalSim = 0;
    let totalPendentes = 0;
    let diasComDados = 0;

    ultimos7.forEach((data) => {
      const regsDia = registros.filter((r) => r.data === data);
      if (regsDia.length > 0) diasComDados++;
      totalSim += regsDia.filter((r) => r.vaiAlmocar === true).length;
    });

    const periodo = diasComDados || 1;
    const mediaDiaria = (totalSim / periodo).toFixed(1);
    const pctTotal = total > 0 ? ((totalSim / (total * periodo)) * 100).toFixed(1) : 0;
    const pctPendentes = total > 0 ? ((totalPendentes / total) * 100).toFixed(1) : 0;

    let html = '<table class="tabela"><thead><tr><th>Métrica</th><th>Valor</th></tr></thead><tbody>';
    html += "<tr><td>Total respondente (alas 7 dias)</td><td>" + totalSim + "</td></tr>";
    html += "<tr><td>Média diária de alunos que almoçam</td><td>" + mediaDiaria + "</td></tr>";
    html += "<tr><td>% da capacidade utilizada</td><td>" + pctTotal + "%</td></tr>";
    html += "</tbody></table>";
    document.getElementById("tabela-aproveitamento").innerHTML = html;
  },

  async _renderizarGraficoBarras(registros) {
    const ultimos7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      ultimos7.push(d.toISOString().split("T")[0]);
    }

    const labels = ultimos7.map((d) => {
      const parts = d.split("-");
      return parts[2] + "/" + parts[1];
    });

    const dadosSim = [];
    const dadosNao = [];

    ultimos7.forEach((data) => {
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
          { label: "Sim (vai almoçar)", data: dadosSim, backgroundColor: "#66bb6a" },
          { label: "Não", data: dadosNao, backgroundColor: "#ef5350" }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
        scales: { y: { beginAtZero: true } }
      }
    });
  },

  _renderizarHistorico(registros) {
    const container = document.getElementById("tabela-historico");

    if (registros.length === 0) {
      container.innerHTML = "<p style='color:#999;'>Nenhum registro encontrado.</p>";
      return;
    }

    const porData = {};
    registros.forEach((r) => {
      if (!porData[r.data]) {
        porData[r.data] = { sim: 0, nao: 0, pendente: 0 };
      }
      if (r.vaiAlmocar === true) porData[r.data].sim++;
      if (r.vaiAlmocar === false) porData[r.data].nao++;
    });

    const datas = Object.keys(porData).sort().reverse();

    let html = '<table class="tabela"><thead><tr><th>Data</th><th>SIM</th><th>NÃO</th></tr></thead><tbody>';
    datas.forEach((data) => {
      const d = porData[data];
      html += "<tr>";
      html += "<td>" + data.split("-").reverse().join("/") + "</td>";
      html += "<td>" + d.sim + " pessoas</td>";
      html += "<td>" + d.nao + " pessoas</td>";
      html += "</tr>";
    });
    html += "</tbody></table>";
    container.innerHTML = html;
  }
};

(function () {
  const usuario = Auth.getUsuarioLogado();
  if (!usuario) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("usuario-nome").textContent = usuario.nome;
  Relatorio.carregar();
})();