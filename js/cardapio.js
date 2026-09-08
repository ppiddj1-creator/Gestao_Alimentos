// cardapio.js — Lógica do Cardápio (só o prato do almoço por dia)

const Cardapio = {
  editandoId: null,

  async carregar() {
    const cardapio = await Database.getColecao("cardapio");
    const ordenado = ["segunda", "terca", "quarta", "quinta", "sexta"];
    const nomes = { segunda: "Segunda", terca: "Terça", quarta: "Quarta", quinta: "Quinta", sexta: "Sexta" };

    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const diaAmanha = this._obterDiaSemana(amanha);

    let html = '<table class="grade-cardapio"><thead><tr>';
    ordenado.forEach((d) => {
      const cls = d === diaAmanha ? ' class="hoje"' : "";
      html += "<th" + cls + ">" + nomes[d] + (d === diaAmanha ? " (amanhã) 🍽️" : "") + "</th>";
    });
    html += "</tr></thead><tbody><tr>";

    ordenado.forEach((d) => {
      const item = cardapio.find((c) => c.id === d);
      const cls = d === diaAmanha ? ' class="hoje"' : "";
      html += "<td" + cls + ">";
      html += item && item.prato ? item.prato : '<span style="color:#999;">Sem cardápio</span>';
      html += '<br><br><button class="btn btn-azul" style="font-size:13px; padding:6px 12px;" onclick="Cardapio.editar(\'' + d + '\')">Editar</button>';
      html += "</td>";
    });

    html += "</tr></tbody></table>";
    document.getElementById("grade-cardapio-container").innerHTML = html;
  },

  abrirModalNova() {
    this.editandoId = null;
    document.getElementById("modal-titulo").textContent = "Editar Cardápio do Dia";
    document.getElementById("form-cardapio").reset();
    document.getElementById("modal-cardapio").style.display = "flex";
  },

  async editar(dia) {
    const item = await Database.getDocumento("cardapio", dia);
    this.editandoId = dia;
    document.getElementById("modal-titulo").textContent = "Editar Cardápio do Dia";
    document.getElementById("c-dia").value = dia;
    document.getElementById("c-prato").value = item && item.prato ? item.prato : "";
    document.getElementById("modal-cardapio").style.display = "flex";
  },

  async salvar() {
    const dia = document.getElementById("c-dia").value;
    const prato = document.getElementById("c-prato").value.trim();

    if (!prato) {
      alert("Digite o prato do almoço.");
      return;
    }

    const existente = await Database.getDocumento("cardapio", dia);

    if (existente) {
      await Database.atualizar("cardapio", dia, { prato });
    } else {
      const dias = {
        segunda: "Segunda-feira",
        terca: "Terça-feira",
        quarta: "Quarta-feira",
        quinta: "Quinta-feira",
        sexta: "Sexta-feira"
      };
      await Database.adicionar("cardapio", { diaSemana: dias[dia], prato }, dia);
    }

    document.getElementById("modal-cardapio").style.display = "none";
    this.carregar();
  },

  fecharModal(event) {
    if (event.target === document.getElementById("modal-cardapio")) {
      document.getElementById("modal-cardapio").style.display = "none";
    }
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
  Cardapio.carregar();

  document.getElementById("form-cardapio").addEventListener("submit", (e) => {
    e.preventDefault();
    Cardapio.salvar();
  });
})();