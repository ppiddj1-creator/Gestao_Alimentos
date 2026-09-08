// dados-iniciais.js — Popula o localStorage com dados de teste

(function () {
  // Versão dos dados de teste — se mudar, recarrega tudo
  const VERSAO = "v2-almoco";
  if (localStorage.getItem("dadosInicializados") === VERSAO) return;

  // Admin fixo (sempre disponível)
  const admin = [
    {
      id: "admin",
      nome: "Administrador",
      usuario: "admin",
      senha: "admin",
      perfil: "admin"
    }
  ];

  // Pessoas de exemplo
  const pessoas = [
    {
      id: "p1",
      nome: "Maria Silva",
      categoria: "aluno",
      turmaSetor: "3º Ano A",
      matricula: "2026001",
      senha: "123456",
      telefone: "(11) 99999-0001",
      criadoEm: "2026-08-25"
    },
    {
      id: "p2",
      nome: "João Santos",
      categoria: "aluno",
      turmaSetor: "3º Ano A",
      matricula: "2026002",
      senha: "123456",
      telefone: "(11) 99999-0002",
      criadoEm: "2026-08-25"
    },
    {
      id: "p3",
      nome: "Ana Oliveira",
      categoria: "aluno",
      turmaSetor: "3º Ano A",
      matricula: "2026003",
      senha: "123456",
      telefone: "(11) 99999-0003",
      criadoEm: "2026-08-25"
    },
    {
      id: "p4",
      nome: "Beatriz Costa",
      categoria: "aluno",
      turmaSetor: "3º Ano A",
      matricula: "2026004",
      senha: "123456",
      telefone: "(11) 99999-0004",
      criadoEm: "2026-08-25"
    },
    {
      id: "p5",
      nome: "Carlos Souza",
      categoria: "professor",
      turmaSetor: "Matemática",
      matricula: "2026005",
      senha: "123456",
      telefone: "(11) 99999-0005",
      criadoEm: "2026-08-25"
    }
  ];

  // Cardápio da semana — só o prato do almoço
  const cardapio = [
    { id: "segunda", diaSemana: "Segunda-feira", prato: "Arroz com frango, feijão e salada" },
    { id: "terca", diaSemana: "Terça-feira", prato: "Arroz com carne, feijão e legume" },
    { id: "quarta", diaSemana: "Quarta-feira", prato: "Arroz com peixe, feijão e farofa" },
    { id: "quinta", diaSemana: "Quinta-feira", prato: "Arroz com ovo, feijão e salada" },
    { id: "sexta", diaSemana: "Sexta-feira", prato: "Arroz com lentilha, feijão e vinagrete" }
  ];

  // Limpa dados antigos (se houver) antes de recarregar
  ['pessoas', 'cardapio', 'registros', 'usuarios'].forEach((colecao) => {
    localStorage.removeItem("colecao_" + colecao);
  });

  localStorage.setItem("colecao_admin", JSON.stringify(admin));
  localStorage.setItem("colecao_pessoas", JSON.stringify(pessoas));
  localStorage.setItem("colecao_cardapio", JSON.stringify(cardapio));
  localStorage.setItem("dadosInicializados", VERSAO);

  console.log("Dados iniciais carregados com sucesso!");
})();