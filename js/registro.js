// registro.js — Lógica do Registro Diário (Admin/Professor) — só almoço

const Registro = {
  async carregarPessoas() {
    const data = document.getElementById("data-registro").value;
    if (!data) {
      this._mostrarAlerta("Selecione uma data.", "erro");
      return;
    }

    const pessoas = await Database.getColecao("pessoas");
    const registrosDia = await Database.buscarPorCampo("registros", "data", data);

    const registroMap = {};
    registrosDia.forEach((r) => {
      registroMap[r.pessoaId] = r;
    });

    if (pessoas.length === 0) {
      this._mostrarAlerta("Nenhuma pessoa cadastrada. Cadastre primeiro no menu Cadastro.", "aviso");
      return;
    }

    const catLabel = { aluno: "Aluno(a)", professor: "Professor(a)", funcionario: "Funcionário(a)" };
    let html = '<table class="tabela"><thead><tr>';
    html += '<th>Nome</th><th>Matrícula</th><th>Categoria</th>';
    html += '<th>Vai almoçar?</th>';
    html += '</tr></thead><tbody>';

    pessoas.forEach((p) => {
      const reg = registroMap[p.id] || {};
      const vaiAlmocar = reg.vaiAlmocar === true;
      const naoVai = reg.vaiAlmocar === false;

      html += "<tr>";
      html += "<td>" + p.nome + "</td>";
      html += "<td>" + p.matricula + "</td>";
      html += "<td>" + (catLabel[p.categoria] || p.categoria) + "</td>";

      if (reg.vaiAlmocar === undefined) {
        // sem registro ainda — mostra só o SIM
        html += '<td><input type="checkbox" class="chk-sim" data-id="' + p.id + '"></td>';
      } else {
        html += "<td>";
        html += '<label style="margin-right:10px;"><input type="radio" class="rdo-almoco" data-id="' + p.id + '" name="op_' + p.id + '" value="sim" ' + (vaiAlmocar ? "checked" : "") + "> SIM</label>";
        html += '<label><input type="radio" class="rdo-almoco" data-id="' + p.id + '" name="op_' + p.id + '" value="nao" ' + (naoVai ? "checked" : "") + "> NÃO</label>";
        html += "</td>";
      }

      html += "</tr>";
    });

    html += "</tbody></table>";

    document.getElementById("lista-pessoas-registro").innerHTML = html;
    document.getElementById("card-lista").style.display = "block";

    document.getElementById("lista-pessoas-registro").addEventListener("change", () => {
      this._atualizarResumo();
    });

    this._atualizarResumo();
  },

  marcarTodos(marcado) {
    document.querySelectorAll(".chk-sim").forEach((chk) => {
      chk.checked = marcado;
    });
    this._atualizarResumo();
  },

  async salvar() {
    const data = document.getElementById("data-registro").value;
    if (!data) {
      this._mostrarAlerta("Selecione uma data.", "erro");
      return;
    }

    const registros = await Database.buscarPorCampo("registros", "data", data);
    const pessoas = await Database.getColecao("pessoas");

    for (const pessoa of pessoas) {
      const pessoaId = pessoa.id;
      const existente = registros.find((r) => r.pessoaId === pessoaId);

      const checkbox = document.querySelector('.chk-sim[data-id="' + pessoaId + '"]');
      const radio = document.querySelector('.rdo-almoco[data-id="' + pessoaId + '"]:checked');

      let vaiAlmocar = null;
      if (checkbox) {
        vaiAlmocar = checkbox.checked;
      } else if (radio) {
        vaiAlmocar = radio.value === "sim";
      }

      if (vaiAlmocar === null) continue;

      if (existente) {
        existente.vaiAlmocar = vaiAlmocar;
        await Database.atualizar("registros", existente.id, { vaiAlmocar });
      } else {
        await Database.adicionar("registros", {
          data,
          pessoaId,
          vaiAlmocar,
          registradoPor: Auth.getUsuarioLogado().id,
          registradoEm: new Date().toISOString()
        });
      }
    }

    this._mostrarAlerta("Registro salvo com sucesso!", "sucesso");
    await this.carregarPessoas();
  },

  _atualizarResumo() {
    const sims = document.querySelectorAll(".chk-sim:checked").length + document.querySelectorAll('.rdo-almoco[value="sim"]:checked').length;
    document.getElementById("resumo-registros").textContent = "Vão almoçar: " + sims + " pessoas";
  },

  _mostrarAlerta(msg, tipo) {
    const alerta = document.getElementById("alerta-registro");
    alerta.textContent = msg;
    alerta.className = "alerta alerta-" + tipo;
    setTimeout(() => alerta.classList.add("oculto"), 4000);
  }
};

(function () {
  const usuario = Auth.getUsuarioLogado();
  if (!usuario) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("usuario-nome").textContent = usuario.nome;

  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  document.getElementById("data-registro").value = amanha.toISOString().split("T")[0];

  document.getElementById("marcar-todos").addEventListener("change", (e) => Registro.marcarTodos(e.target.checked));
})();