const Auth = {
  USuarioLogado: null,

  async login(usuario, senha) {
    if (usuario === "admin" && senha === "admin") {
      const usuarioAdmin = {
        id: "admin",
        usuario: "admin",
        nome: "Administrador",
        perfil: "admin"
      };
      this.SalvarSessao(usuarioAdmin);
      return usuarioAdmin;
    }

    // Pessoas: login = 2 primeiros nomes (ex.: DavidsonOliveira); fallback na matrícula
    let pessoas = await Database.buscarPorCampo("pessoas", "login", usuario);
    if (pessoas.length === 0) {
      pessoas = await Database.buscarPorCampo("pessoas", "matricula", usuario);
    }
    if (pessoas.length > 0) {
      const pessoa = pessoas[0];
      if (pessoa.senha === senha) {
        const pessoaLogada = {
          id: pessoa.id,
          usuario: pessoa.login || pessoa.matricula,
          nome: pessoa.nome,
          perfil: pessoa.categoria === "aluno" ? "aluno" : pessoa.categoria
        };
        this.SalvarSessao(pessoaLogada);
        return pessoaLogada;
      }
    }

    // Usuários criados pelo Admin (coleção/tabela "usuarios")
    const usuarios = await Database.buscarPorCampo("usuarios", "usuario", usuario);
    if (usuarios.length > 0) {
      const u = usuarios[0];
      if (u.senha === senha) {
        const usuarioLogado = {
          id: u.id,
          usuario: u.usuario,
          nome: u.nome,
          perfil: u.perfil
        };
        this.SalvarSessao(usuarioLogado);
        return usuarioLogado;
      }
    }

    throw new Error("Usuário ou senha inválidos");
  },

  SalvarSessao(usuario) {
    this.USuarioLogado = usuario;
    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
  },

  getUsuarioLogado() {
    if (this.USuarioLogado) return this.USuarioLogado;
    const dados = localStorage.getItem("usuarioLogado");
    if (dados) {
      this.USuarioLogado = JSON.parse(dados);
      return this.USuarioLogado;
    }
    return null;
  },

  sair() {
    this.USuarioLogado = null;
    localStorage.removeItem("usuarioLogado");
  },

  estaLogado() {
    return this.getUsuarioLogado() !== null;
  },

  temPermissao(perfisPermitidos) {
    const usuario = this.getUsuarioLogado();
    if (!usuario) return false;
    if (usuario.perfil === "admin") return true;
    return perfisPermitidos.includes(usuario.perfil);
  },

  redirecionarParaPerfil() {
    const usuario = this.getUsuarioLogado();
    if (!usuario) return "index.html";
    if (usuario.perfil === "aluno") return "registro-aluno.html";
    return "dashboard.html";
  },

  verificarAcesso(perfisPermitidos) {
    const usuario = this.getUsuarioLogado();
    if (!usuario) {
      window.location.href = "index.html";
      return false;
    }
    if (!this.temPermissao(perfisPermitidos)) {
      window.location.href = this.redirecionarParaPerfil();
      return false;
    }
    return true;
  }
};
