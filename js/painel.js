const Painel = {
  async inicializar() {
    if (!document.getElementById("total-cadastrados")) return;

    const pessoas = await Database.getColecao("pessoas");

    const totalEl = document.getElementById("total-cadastrados");
    if (totalEl) totalEl.textContent = pessoas.length;

    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const dias = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    const dataEl = document.getElementById("data-amanha");
    if (dataEl) {
      dataEl.textContent = dias[amanha.getDay()] + ", " + amanha.getDate() + " de " + meses[amanha.getMonth()];
    }

    await this._resumoRefeicoes(pessoas);
    await this._graficoFrequencia();
  },

  async _resumoRefeicoes(pessoas) {
    const registros = await Database.getColecao("registros");
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const data = amanha.toISOString().split("T")[0];

    const sims = registros.filter((r) => r.data === data && r.vaiAlmocar === true).length;
    const totalRegistrados = registros.filter((r) => r.data === data).length;
    const pendentes = Math.max(0, pessoas.length - totalRegistrados);

    const el = document.getElementById("resumo-refeicoes");
    if (el) el.textContent = sims + " confirmaram · " + pendentes + " pendentes";
  },

  async _graficoFrequencia() {
    const canvas = document.getElementById("grafico-frequencia");
    if (!canvas) return;

    const registros = await Database.getColecao("registros");
    const ultimos7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      ultimos7.push(d.toISOString().split("T")[0]);
    }

    const labels = ultimos7.map((d) => {
      const p = d.split("-");
      return p[2] + "/" + p[1];
    });

    const sim = [];
    const nao = [];
    ultimos7.forEach((data) => {
      const regs = registros.filter((r) => r.data === data);
      sim.push(regs.filter((r) => r.vaiAlmocar === true).length);
      nao.push(regs.filter((r) => r.vaiAlmocar === false).length);
    });

    new Chart(canvas.getContext("2d"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Vão almoçar", data: sim, backgroundColor: "#0F7A35", borderRadius: 8, maxBarThickness: 26 },
          { label: "Não vão", data: nao, backgroundColor: "#F2B8BC", borderRadius: 8, maxBarThickness: 26 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { usePointStyle: true, pointStyle: "circle", padding: 18 } }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: "#EEF2F0" }, ticks: { precision: 0 } },
          x: { grid: { display: false } }
        }
      }
    });
  }
};

(function () {
  Painel.inicializar();
})();