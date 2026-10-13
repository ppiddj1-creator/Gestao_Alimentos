const RelatorioExtra = {
  graficoPizza: null,

  async inicializar() {
    await this._preencherFiltros();
    await this._renderizarPizza();
  },

  async _preencherFiltros() {
    const select = document.getElementById("filtro-turma");
    if (!select) return;

    const pessoas = await Database.getColecao("pessoas");
    const turmas = [...new Set(pessoas.map((p) => (p.turmaSetor || "").trim()).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, "pt-BR")
    );

    select.innerHTML = '<option value="">Todas as turmas/setores</option>';
    turmas.forEach((t) => {
      select.innerHTML += '<option value="' + t + '">' + t + "</option>";
    });
  },

  async _renderizarPizza() {
    const canvas = document.getElementById("grafico-pizza");
    if (!canvas) return;

    const pessoas = await Database.getColecao("pessoas");
    const cont = { aluno: 0, professor: 0, funcionario: 0 };
    pessoas.forEach((p) => {
      if (cont[p.categoria] !== undefined) cont[p.categoria]++;
    });

    if (this.graficoPizza) this.graficoPizza.destroy();

    this.graficoPizza = new Chart(canvas.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: ["Alunos", "Professores", "Funcionários"],
        datasets: [
          {
            data: [cont.aluno, cont.professor, cont.funcionario],
            backgroundColor: ["#0F7A35", "#34C759", "#AEE6BE"],
            borderColor: "#FFFFFF",
            borderWidth: 3,
            hoverOffset: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { usePointStyle: true, pointStyle: "circle", padding: 18 } }
        }
      }
    });
  },

  // Mantido por compatibilidade: o filtro agora é único (Relatorio.filtrar)
  filtrar() {
    return Relatorio.filtrar();
  },

  _renderizarHistorico(registros) {
    const container = document.getElementById("tabela-historico");
    if (!container) return;

    if (registros.length === 0) {
      container.innerHTML = "<p class='sem-dados'>Nenhum registro encontrado.</p>";
      return;
    }

    const porData = {};
    registros.forEach((r) => {
      if (!porData[r.data]) porData[r.data] = { sim: 0, nao: 0 };
      if (r.vaiAlmocar === true) porData[r.data].sim++;
      if (r.vaiAlmocar === false) porData[r.data].nao++;
    });

    const datas = Object.keys(porData).sort().reverse();

    let html = '<table class="tabela"><thead><tr><th>Data</th><th>Confirmados</th><th>Não vão</th><th>Proporção</th></tr></thead><tbody>';
    datas.forEach((data) => {
      const d = porData[data];
      const total = d.sim + d.nao;
      const pct = total ? Math.round((d.sim / total) * 100) : 0;
      html += "<tr>";
      html += "<td><strong>" + data.split("-").reverse().join("/") + "</strong></td>";
      html += "<td><span class='badge badge-ativo'>" + d.sim + "</span></td>";
      html += "<td>" + d.nao + "</td>";
      html += "<td><div class='barra-progresso'><span style='width:" + pct + "%'></span></div><small class='stat-detalhe'>" + pct + "% de presença</small></td>";
      html += "</tr>";
    });
    html += "</tbody></table>";
    container.innerHTML = html;
  },

  exportarPDF() {
    window.print();
  }
};

(function () {
  if (!Auth.getUsuarioLogado() || !Auth.temPermissao([])) return;
  RelatorioExtra.inicializar();
})();