const Auth = {
  USuarioLogado: null,

  // Perfis que usam a tela simples de resposta (SIM/NÃO) — igual aos alunos
  RESPOSTA: ["aluno", "professor", "funcionario"],

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

    if (usuario === "Gestao" && senha === "Diretoria@2026") {
      const usuarioGestao = {
        id: "gestao",
        usuario: "Gestao",
        nome: "Gestão - Diretoria",
        perfil: "gestao"
      };
      this.SalvarSessao(usuarioGestao);
      return usuarioGestao;
    }

    // Pessoas: login = 2 primeiros nomes (ex.: DavidsonOliveira); fallback na matrícula
    let pessoas, usuarios;
    try {
      pessoas = await Database.buscarPorCampo("pessoas", "login", usuario);
      if (pessoas.length === 0) {
        pessoas = await Database.buscarPorCampo("pessoas", "matricula", usuario);
      }
    } catch (erro) {
      // Erro de rede/banco: não dá para afirmar que a senha está errada
      throw new Error(Database.erroAmigavel(erro));
    }
    if (pessoas.length > 0) {
      const pessoa = pessoas[0];
      if (pessoa.senha === senha) {
        const pessoaLogada = {
          id: pessoa.id,
          usuario: pessoa.login || pessoa.matricula,
          nome: pessoa.nome,
          perfil: pessoa.categoria === "aluno" ? "aluno" : pessoa.categoria,
          origem: "pessoas"
        };
        this.SalvarSessao(pessoaLogada);
        return pessoaLogada;
      }
    }

    // Usuários criados pelo Admin (coleção/tabela "usuarios")
    try {
      usuarios = await Database.buscarPorCampo("usuarios", "usuario", usuario);
    } catch (erro) {
      throw new Error(Database.erroAmigavel(erro));
    }
    if (usuarios.length > 0) {
      const u = usuarios[0];
      if (u.senha === senha) {
        const usuarioLogado = {
          id: u.id,
          usuario: u.usuario,
          nome: u.nome,
          perfil: u.perfil,
          origem: "usuarios"
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

  // Troca de senha do próprio usuário (perfis comuns: aluno, professor, funcionário)
  async alterarSenha(senhaAtual, novaSenha, confirmacao) {
    const usuario = this.getUsuarioLogado();
    if (!usuario || !usuario.origem) {
      throw new Error("Este perfil não permite alterar a senha.");
    }
    if (!senhaAtual || !novaSenha || !confirmacao) {
      throw new Error("Preencha todos os campos.");
    }
    if (novaSenha.length < 6) {
      throw new Error("A nova senha deve ter pelo menos 6 caracteres.");
    }
    if (novaSenha !== confirmacao) {
      throw new Error("A nova senha e a confirmação não coincidem.");
    }
    if (novaSenha === senhaAtual) {
      throw new Error("A nova senha deve ser diferente da atual.");
    }

    let registro;
    try {
      registro = await Database.getDocumento(usuario.origem, usuario.id);
    } catch (erro) {
      throw new Error(Database.erroAmigavel(erro));
    }
    if (!registro || registro.senha !== senhaAtual) {
      throw new Error("Senha atual incorreta.");
    }

    try {
      await Database.atualizar(usuario.origem, usuario.id, { senha: novaSenha });
    } catch (erro) {
      throw new Error(Database.erroAmigavel(erro));
    }
    return true;
  },

  // Perfis com acesso total à administração (admin e gestão/diretoria)
  ehAdmin() {
    const usuario = this.getUsuarioLogado();
    if (!usuario) return false;
    return usuario.perfil === "admin" || usuario.perfil === "gestao";
  },

  temPermissao(perfisPermitidos) {
    const usuario = this.getUsuarioLogado();
    if (!usuario) return false;
    if (this.ehAdmin()) return true;
    return perfisPermitidos.includes(usuario.perfil);
  },

  redirecionarParaPerfil() {
    const usuario = this.getUsuarioLogado();
    if (!usuario) return "index.html";
    // Admin e gestão entram na administração; todos os demais vão para a tela SIM/NÃO
    if (this.ehAdmin()) return "dashboard.html";
    return "registro-aluno.html";
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
