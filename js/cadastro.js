// cadastro.js — Logica do Cadastro de Pessoas

const Cadastro = {
  editandoId: null,

  async carregar() {
    const pessoas = await Database.getColecao("pessoas");
    this._renderizarTabela(pessoas);

    const busca = document.getElementById("busca-pessoas");
    busca.addEventListener("input", async () => {
      const filtro = busca.value.toLowerCase();
      const todas = await Database.getColecao("pessoas");
      const filtradas = todas.filter(
        (p) =>
          p.nome.toLowerCase().includes(filtro) ||
          p.matricula.includes(filtro) ||
          p.categoria.toLowerCase().includes(filtro)
      );
      this._renderizarTabela(filtradas);
    });

    document.getElementById("form-cadastro").addEventListener("submit", (e) => {
      e.preventDefault();
      this.salvar();
    });
  },

  async salvar() {
    const nome = document.getElementById("nome").value.trim();
    const categoria = document.getElementById("categoria").value;
    const turmaSetor = document.getElementById("turmaSetor").value.trim();
    const matricula = document.getElementById("matricula").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const senha = document.getElementById("senha-cadastro").value;

    if (!nome || !categoria || !turmaSetor || !matricula || !senha) {
      this._mostrarAlerta("Preencha todos os campos obrigatórios.", "erro");
      return;
    }

    const dados = {
      nome,
      categoria,
      turmaSetor,
      matricula,
      telefone,
      senha,
      criadoEm: new Date().toISOString().split("T")[0]
    };

    try {
      if (this.editandoId) {
        await Database.atualizar("pessoas", this.editandoId, dados);
        this._mostrarAlerta("Pessoa atualizada com sucesso!", "sucesso");
      } else {
        const existente = await Database.buscarPorCampo("pessoas", "matricula", matricula);
        if (existente.length > 0) {
          this._mostrarAlerta("Já existe uma pessoa com essa matrícula.", "erro");
          return;
        }
        await Database.adicionar("pessoas", dados);
        this._mostrarAlerta("Pessoa cadastrada com sucesso!", "sucesso");
      }
      this.limparForm();
      this.carregar();
    } catch (erro) {
      this._mostrarAlerta("Erro ao salvar: " + erro.message, "erro");
    }
  },

  async editar(id) {
    const pessoa = await Database.getDocumento("pessoas", id);
    if (!pessoa) return;

    this.editandoId = id;
    document.getElementById("nome").value = pessoa.nome;
    document.getElementById("categoria").value = pessoa.categoria;
    document.getElementById("turmaSetor").value = pessoa.turmaSetor;
    document.getElementById("matricula").value = pessoa.matricula;
    document.getElementById("telefone").value = pessoa.telefone || "";
    document.getElementById("senha-cadastro").value = pessoa.senha;
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  async excluir(id) {
    if (!confirm("Tem certeza que deseja excluir esta pessoa?")) return;
    try {
      await Database.excluir("pessoas", id);
      this._mostrarAlerta("Pessoa excluída com sucesso!", "sucesso");
      this.carregar();
    } catch (erro) {
      this._mostrarAlerta("Erro ao excluir: " + erro.message, "erro");
    }
  },

  limparForm() {
    this.editandoId = null;
    document.getElementById("form-cadastro").reset();
    document.getElementById("senha-cadastro").value = "123456";
  },

  _renderizarTabela(pessoas) {
    const container = document.getElementById("tabela-pessoas");
    if (pessoas.length === 0) {
      container.innerHTML = "<p style='color:#999;'>Nenhuma pessoa cadastrada.</p>";
      return;
    }

    const catLabel = { aluno: "Aluno(a)", professor: "Professor(a)", funcionario: "Funcionário(a)" };

    let html = '<table class="tabela"><thead><tr>';
    html += '<th>Nome</th><th>Matrícula</th><th>Categoria</th><th>Turma/Setor</th><th>Ações</th>';
    html += '</tr></thead><tbody>';

    pessoas.forEach((p) => {
      html += "<tr>";
      html += "<td>" + p.nome + "</td>";
      html += "<td>" + p.matricula + "</td>";
      html += "<td>" + (catLabel[p.categoria] || p.categoria) + "</td>";
      html += "<td>" + (p.turmaSetor || "-") + "</td>";
      html += '<td><div class="acao-botoes">';
      html += '<button class="btn btn-azul" onclick="Cadastro.editar(\'' + p.id + '\')">Editar</button>';
      html += '<button class="btn btn-vermelho" onclick="Cadastro.excluir(\'' + p.id + '\')">Excluir</button>';
      html += "</div></td>";
      html += "</tr>";
    });

    html += "</tbody></table>";
    container.innerHTML = html;
  },

  _mostrarAlerta(msg, tipo) {
    const alerta = document.getElementById("alerta-cadastro");
    alerta.textContent = msg;
    alerta.className = "alerta alerta-" + tipo;
    setTimeout(() => alerta.classList.add("oculto"), 4000);
  }
};

(function () {
  const usuario = Auth.getUsuarioLogado();
  if (!usuario || usuario.perfil !== "admin") {
    window.location.href = Auth.redirecionarParaPerfil();
    return;
  }

  document.getElementById("usuario-nome").textContent = usuario.nome;
  Cadastro.carregar();
})();
