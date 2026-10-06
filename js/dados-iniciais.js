// dados-iniciais.js — Seed idempotente no Supabase
// Grava dados de teste apenas se a coleção "admin" estiver vazia.
// Nunca apaga registros ou usuários existentes.

window.DADOS_INICIAIS_PRONTO = (async () => {
  try {
    const { count, error: erroContagem } = await sb
      .from("admin")
      .select("id", { count: "exact", head: true });
    if (erroContagem) throw erroContagem;
    if (count > 0) return;

    const admin = [
      {
        id: "admin",
        nome: "Administrador",
        usuario: "admin",
        senha: "admin",
        perfil: "admin"
      }
    ];

    const pessoas = [
      {
        id: "p1",
        nome: "Maria Silva",
        categoria: "aluno",
        turmaSetor: "3º Ano A",
        matricula: "2026001",
        login: "MariaSilva",
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
        login: "JoaoSantos",
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
        login: "AnaOliveira",
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
        login: "BeatrizCosta",
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
        login: "CarlosSouza",
        senha: "123456",
        telefone: "(11) 99999-0005",
        criadoEm: "2026-08-25"
      }
    ];

    const cardapio = [
      { id: "segunda", diaSemana: "Segunda-feira", prato: "Arroz com frango, feijão e salada" },
      { id: "terca", diaSemana: "Terça-feira", prato: "Arroz com carne, feijão e legume" },
      { id: "quarta", diaSemana: "Quarta-feira", prato: "Arroz com peixe, feijão e farofa" },
      { id: "quinta", diaSemana: "Quinta-feira", prato: "Arroz com ovo, feijão e salada" },
      { id: "sexta", diaSemana: "Sexta-feira", prato: "Arroz com lentilha, feijão e vinagrete" }
    ];

    const opcoes = { onConflict: "id", ignoreDuplicates: true };
    const { error: e1 } = await sb.from("admin").upsert(admin, opcoes);
    const { error: e2 } = await sb.from("pessoas").upsert(pessoas, opcoes);
    const { error: e3 } = await sb.from("cardapio").upsert(cardapio, opcoes);
    const erro = e1 || e2 || e3;
    if (erro) throw erro;

    console.log("Dados iniciais carregados no Supabase!");
  } catch (erro) {
    console.error("Erro ao carregar dados iniciais:", erro);
  }
})();
