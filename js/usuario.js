// usuario.js — Gerenciar Usuários (Admin)

const Usuario = {
  async inicializar() {
    await this._carregarPessoasSelect();
    await this.carregar();

    document.getElementById("form-usuario").addEventListener("submit", (e) => {
      e.preventDefault();
      this.criar();
    });
  },

  async _carregarPessoasSelect() {
    const pessoas = await Database.getColecao("pessoas");
    const select = document.getElementById("u-pessoa");
    select.innerHTML = '<option value="">Selecionar pessoa...</option>';
    pessoas.forEach((p) => {
      select.innerHTML += '<option value="' + p.id + '">' + p.nome + ' (' + p.matricula + ')</option>';
    });
  },

  async criar() {
    const pessoaId = document.getElementById("u-pessoa").value;
    const perfil = document.getElementById("u-perfil").value;
    const usuarioLogin = document.getElementById("u-usuario").value.trim();
    const senha = document.getElementById("u-senha").value;

    if (!usuarioLogin || !senha) {
      this._mostrarAlerta("Preencha usuário e senha.", "erro");
      return;
    }

    const existente = await Database.buscarPorCampo("usuarios", "usuario", usuarioLogin);
    if (existente.length > 0) {
      this._mostrarAlerta("Já existe um usuário com esse login.", "erro");
      return;
    }

    const pessoa = pessoaId ? await Database.getDocumento("pessoas", pessoaId) : null;

    await Database.adicionar("usuarios", {
      usuario: usuarioLogin,
      senha,
      nome: pessoa ? pessoa.nome : usuarioLogin,
      perfil,
      pessoaId: pessoaId || null,
      criadoEm: new Date().toISOString().split("T")[0]
    });

    this._mostrarAlerta("Usuário criado com sucesso!", "sucesso");
    document.getElementById("form-usuario").reset();
    await this.carregar();
  },

  async excluir(id) {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      await Database.excluir("usuarios", id);
      this._mostrarAlerta("Usuário excluído com sucesso!", "sucesso");
      await this.carregar();
    } catch (erro) {
      this._mostrarAlerta("Erro ao excluir: " + erro.message, "erro");
    }
  },

  async carregar() {
    const admin = { id: "admin", usuario: "admin", nome: "Administrador", perfil: "admin" };
    const outros = await Database.buscarPorOrdem("usuarios", "usuario");
    const todos = [admin, ...outros];

    const perfilLabel = { admin: "Admin", nutricionista: "Nutricionista", professor: "Professor" };

    let html = '<table class="tabela"><thead><tr>';
    html += '<th>Nome</th><th>Usuário (login)</th><th>Perfil</th><th>Ações</th>';
    html += "</tr></thead><tbody>";

    todos.forEach((u) => {
      html += "<tr>";
      html += "<td>" + u.nome + "</td>";
      html += "<td>" + u.usuario + "</td>";
      html += "<td>" + (perfilLabel[u.perfil] || u.perfil) + "</td>";
      html += "<td>";
      if (u.id !== "admin") {
        html += '<button class="btn btn-vermelho" onclick="Usuario.excluir(\'' + u.id + '\')">Excluir</button>';
      } else {
        html += '<span style="color:#999;">Padrão</span>';
      }
      html += "</td></tr>";
    });

    html += "</tbody></table>";
    document.getElementById("tabela-usuarios").innerHTML = html;
  },

  _mostrarAlerta(msg, tipo) {
    const alerta = document.getElementById("alerta-usuario");
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
  Usuario.inicializar();
})();
