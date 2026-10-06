# PLANO DO PROJETO — Gestão Eficaz dos Recursos Alimentares

**Projeto Escolar — PPI**

> **Status: EM DESENVOLVIMENTO** — Fases 1 a 10 e 12 concluídas — sistema 100% online (Supabase)

---

## 1. VISÃO GERAL

**Objetivo:** Sistema web para gerenciar o almoço escolar do ensino integral, permitindo cadastrar pessoas, registrar diariamente se cada pessoa vai almoçar (SIM/NÃO), definir o cardápio do almoço e gerar relatórios que auxiliam na redução de desperdício.

**Público-alvo:** Equipe administrativa, professores, funcionários e alunos da escola.

**Tecnologias:** HTML, CSS, JavaScript puro | Supabase (PostgreSQL online, gratuito) | GitHub Pages | Chart.js (CDN)

---

## 2. COMO O SISTEMA FUNCIONA ATUALMENTE

O sistema roda **100% online**, usando o **Supabase** (PostgreSQL gratuito na nuvem, região São Paulo) como banco de dados. Os dados ficam disponíveis de qualquer dispositivo para toda a equipe escolar.

**Como funciona na prática:**
```
1. Admin acessa o site e faz login (admin/admin)
2. Cadastra todas as pessoas (alunos, professores, funcionários)
3. Cadastra o cardápio do almoço da semana (só o prato do almoço por dia)
4. Alunos acessam pelo celular/computador e respondem SIM/NÃO se vão almoçar
   (até 23h59 do dia anterior)
5. Admin vê no dashboard a quantidade de pessoas que responderam SIM, NÃO ou pendentes
6. Relatórios mostram tendências e ajudam a reduzir desperdício
```

### Armazenamento

| | Configuração atual |
|---|---|
| **Banco** | Supabase PostgreSQL — adapter `database-supabase.js` + config `supabase-config.js` |
| **Servidor** | GitHub Pages |
| **Conta necessária** | Supabase (gratuito) + GitHub (gratuito) |

> O schema SQL está versionado em `supabase/migrations/0001_init.sql` (5 tabelas + RLS). O antigo `database.js` (localStorage) ficou como referência/fallback, mas nenhum HTML o carrega mais.

---

## 3. PERFIS DE USUÁRIO E CONTROLE DE ACESSO

### Quem pode acessar?

| Perfil | Quem é | O que pode fazer |
|--------|--------|-----------------|
| **Admin** | Responsável pelo sistema | Tudo: cadastrar pessoas e usuários, editar cardápio, ver registros e relatórios |
| **Professor/Funcionário** | Docente/funcionário da escola | Registrar presença de qualquer pessoa, ver cardápio, dashboard e relatórios |
| **Aluno** | Estudante | Responder SIM/NÃO se vai almoçar (1 dia antes) |

### Regras importantes

- **Somente o Admin** pode cadastrar pessoas no sistema
- **Somente o Admin** pode criar novos usuários (login/senha)
- **Alunos NÃO se cadastram** — são inseridos pelo Admin com matrícula e senha
- **Alunos registram apenas sua opção** (SIM/NÃO) para o dia seguinte

### Login

- Todos os perfis entram com **matrícula/usuário + senha**
- Admin tem login fixo: `admin` / `admin`
- Cada pessoa cadastrada recebe uma **matrícula única numérica**

### Contas de teste pré-cadastradas

| Usuário | Senha | Perfil | Nome |
|---------|-------|--------|------|
| `admin` | `admin` | Admin | Administrador |
| `2026001` | `123456` | Aluno | Maria Silva |
| `2026002` | `123456` | Aluno | João Santos |
| `2026003` | `123456` | Aluno | Ana Oliveira |
| `2026004` | `123456` | Aluno | Beatriz Costa |
| `2026005` | `123456` | Professor | Carlos Souza |

---

## 4. FUNCIONALIDADES POR MÓDULO (ESTADO ATUAL)

### MÓDULO 1 — Autenticação (Login) ✅
- Tela de **login** (matrícula/usuário + senha)
- Redirecionamento por perfil (Aluno → tela do aluno; demais → dashboard)
- Controle de acesso: cada tela verifica o perfil do usuário logado
- Botão de **sair/logout**
- Sessão persistente (não precisa logar toda vez que abre a página)

### MÓDULO 2 — Cadastro de Pessoas (apenas Admin) ✅
- Formulário com campos:
  - **Nome completo** (texto)
  - **Categoria** (select: Aluno, Professor, Funcionário)
  - **Turma/Setor** (texto: "3º Ano A", "Coordenação", "Limpeza")
  - **Matrícula** (número único)
  - **Telefone** (opcional)
  - **Senha** (para a pessoa poder fazer login)
- Tabela com lista de todas as pessoas cadastradas
- Busca por nome, matrícula ou categoria
- Botões de **Editar** e **Excluir** em cada linha

### MÓDULO 3 — Confirmação do Almoço (SIM/NÃO)
#### Para o Aluno (pelo celular/computador): ✅
- Tela simplificada com **apenas 2 opções:**
  - **"SIM, vou almoçar"** (verde)
  - **"NÃO vou almoçar"** (vermelho)
- Mostra o **prato do almoço de amanhã** (cardápio cadastrado)
- Prazo: até **23h59 do dia anterior**
- Confirmação visual de que a opção foi registrada
- Possibilidade de **alterar a opção** antes do prazo

#### Para Professores/Admin (tela de registro): ✅
- Seletor de **data** (padrão: dia seguinte)
- Lista de **todas as pessoas** com resposta SIM/NÃO
- Alunos sem registro: checkbox "SIM" (simples)
- Já registrados: botões de rádio SIM/NÃO
- Marcar/desmarcar todos de uma vez
- Botão **Salvar Registro**
- Resumo: total de pessoas que vão almoçar

### MÓDULO 4 — Cardápio do Almoço (semanal) ✅
- Cadastro do cardápio fixo por **dia da semana** (Segunda a Sexta)
- **Simplificado: apenas o prato do almoço** por dia
- Visualização em **grade semanal** (2ª a 6ª)
- Dia de amanhã destacado com "🍽️ (amanhã)"
- Botão **Editar** em cada dia do cardápio

### MÓDULO 5 — Dashboard (Página Inicial) ✅
- Resumo do almoço de amanhã em **3 cards grandes:**
  - **Vão almoçar** (responderam SIM)
  - **Não vão almoçar** (responderam NÃO)
  - **Ainda não responderam** (pendentes)
- Cardápio de amanhã (prato do dia)
- Cards com total por categoria (Alunos / Professores / Funcionários)
- Acesso rápido para todas as funcionalidades

### MÓDULO 6 — Relatórios ✅
- **Gráfico de barras** (Chart.js): últimas 7 dias — SIM vs NÃO
- Taxa de aproveitamento: média diária de quem almoça, % da capacidade
- Histórico de registros por data (SIM/NÃO)
- Filtro por período (data inicial e final)

---

## 5. ESTRUTURA DE ARQUIVOS (ATUAL)

```
Projeto PPI/
│
├── index.html              ← Login
├── dashboard.html          ← Painel principal (resultado do almoço)
├── cadastro.html           ← Cadastro de pessoas
├── registro.html           ← Registro diário (Admin/Professor)
├── registro-aluno.html     ← Tela simplificada do aluno (SIM/NÃO)
├── cardapio.html           ← Cardápio semanal (só o prato do almoço)
├── relatorio.html          ← Relatórios e gráficos
├── usuario.html            ← Gerenciar usuários (Admin)
│
├── css/
│   └── style.css           ← Estilos gerais (responsivo)
│
└── js/
    ├── dados-iniciais.js   ← Popula o localStorage com dados de teste
    ├── database.js         ← Banco LOCAL (localStorage) — uso atual
    ├── database-firebase.js← Banco Firestore — para o deploy futuro
    ├── firebase-config.js  ← Configuração do Firebase (placeholder)
    ├── auth.js             ← Login, sessão, controle de perfil
    ├── cadastro.js         ← Lógica cadastro de pessoas
    ├── registro.js         ← Lógica registro (Admin/Professor)
    ├── registro-aluno.js   ← Lógica registro simplificado do aluno
    ├── cardapio.js         ← Lógica cardápio (só almoço)
    ├── dashboard.js        ← Lógica painel
    ├── relatorio.js        ← Gráficos + relatórios
    └── usuario.js          ← Gerenciar usuários
```

---

## 6. MODELO DE DADOS (Supabase — tabelas no PostgreSQL)

> Cada "coleção" do localStorage virou uma **tabela** no Supabase, com os mesmos campos (camelCase idêntico ao JS — zero mapeamento). O schema completo está em `supabase/migrations/0001_init.sql`.

### Tabela: admin
```javascript
{
  id: "admin",
  nome: "Administrador",
  usuario: "admin",
  senha: "admin",
  perfil: "admin"
}
```

### Tabela: pessoas
```javascript
{
  id: "p1",
  nome: "Maria Silva",
  categoria: "aluno",        // aluno | professor | funcionario
  turmaSetor: "3º Ano A",
  matricula: "2026001",
  senha: "123456",
  telefone: "(11) 99999-0001",
  criadoEm: "2026-08-25"
}
```

### Tabela: cardapio
```javascript
{
  id: "segunda",             // segunda | terca | quarta | quinta | sexta
  diaSemana: "Segunda-feira",
  prato: "Arroz com frango, feijão e salada"   // só o prato do almoço
}
```

### Tabela: registros
```javascript
{
  id: "r1",
  data: "2026-08-26",        // data do almoço (dia seguinte ao registro)
  pessoaId: "p1",
  vaiAlmocar: true,          // true = SIM | false = NÃO
  registradoPor: "aluno",    // "aluno" ou id do admin/professor
  registradoEm: "2026-08-25T14:30:00"
}
```

### Tabela: usuarios (criados pelo Admin)
```javascript
{
  id: "auto-gerado",
  usuario: "2026003",
  senha: "123456",
  nome: "Ana Oliveira",
  perfil: "professor",
  pessoaId: "p3",
  criadoEm: "2026-08-25"
}
```

### Seed (dados iniciais) — `js/dados-iniciais.js`
- Grava os dados de teste **apenas se a tabela `admin` estiver vazia** (idempotente, seguro com abas simultâneas)
- **Nunca apaga** registros ou usuários existentes (o antigo controle de versão `dadosInicializados` do localStorage foi removido)

---

## 7. FLUXO DO SISTEMA

```
┌─────────────────────────────────────────────────────────────────┐
│                        FLUXO COMPLETO                           │
├─────────────────────────────────────────────────────────────────┤
│  1. ADMIN cadastra todas as pessoas (alunos, prof., func.)     │
│     ↓                                                           │
│  2. ADMIN/NUTRICIONISTA cadastra o cardápio da semana          │
│     (só o prato do almoço de cada dia)                          │
│     ↓                                                           │
│  3. ALUNO acessa no celular/computador (até 23h59 do dia       │
│     anterior) e responde: "SIM, vou almoçar" ou "NÃO vou"      │
│     ↓                                                           │
│  4. PROFESSOR/ADMIN pode ajustar registros no painel           │
│     ↓                                                           │
│  5. SISTEMA conta automaticamente as respostas                 │
│     ↓                                                           │
│  6. ADMIN vê no dashboard:                                      │
│     - Vão almoçar (SIM): X pessoas                              │
│     - Não vão (NÃO): Y pessoas                                  │
│     - Pendentes: Z pessoas                                      │
│     ↓                                                           │
│  7. EQUIPE DE PREPARO prepara a quantidade certa de comida     │
│     ↓                                                           │
│  8. RELATÓRIOS mostram tendências e taxa de aproveitamento     │
│     ↓                                                           │
│  9. Redução de desperdício com planejamento preciso            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. TELAS DO SISTEMA

### Tela 1 — Login
```
┌─────────────────────────────────────┐
│                                     │
│        🍽️ GESTÃO ALIMENTAR         │
│        Escola [Nome da Escola]      │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ Matrícula/Usuário:          │   │
│   │ [________________________]  │   │
│   │                             │   │
│   │ Senha:                      │   │
│   │ [________________________]  │   │
│   │                             │   │
│   │         [ENTRAR]            │   │
│   └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Tela 2 — Dashboard (Admin/Professor)
```
┌──────────────────────────────────────────────────┐
│  PAINEL PRINCIPAL              Usuário: Admin ▼  │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌───────────┐ │
│  │ VÃO ALMOÇAR  │ │ NÃO VÃO      │ │ PENDENTES │ │
│  │     120      │ │     15       │ │     10    │ │
│  │ responderam  │ │ responderam  │ │ sem       │ │
│  │ SIM          │ │ NÃO          │ │ resposta  │ │
│  └──────────────┘ └──────────────┘ └───────────┘ │
│                                                  │
│  ┌──────────────────┐  ┌──────────────────────┐  │
│  │ ALMOÇO DE AMANHÃ │  │ TOTAL CADASTRADOS    │  │
│  │ Arroz com frango │  │ Alunos: 120          │  │
│  │ feijão e salada  │  │ Prof: 15             │  │
│  │                  │  │ Func: 10             │  │
│  └──────────────────┘  └──────────────────────┘  │
│                                                  │
│  [Cadastrar] [Registrar] [Cardápio] [Relatórios]│
└──────────────────────────────────────────────────┘
```

### Tela 3 — Confirmação do Aluno (CELULAR)
```
┌─────────────────────────────────┐
│  📱 CONFIRMAÇÃO DE ALMOÇO       │
│  Data: 26/08/2026 (Quarta)      │
│                                 │
│  Olá, Maria Silva!              │
│  Matrícula: 2026001             │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🍽️ Almoço de amanhã:   │   │
│  │ Arroz com frango,       │   │
│  │ feijão e salada         │   │
│  └─────────────────────────┘   │
│                                 │
│  Você vai almoçar amanhã?       │
│                                 │
│  ┌─────────────┐ ┌────────────┐ │
│  │  SIM, vou   │ │ NÃO vou    │ │
│  │  almoçar ✓  │ │ almoçar ✗  │ │
│  └─────────────┘ └────────────┘ │
│                                 │
│  ✓ Você vai almoçar             │
│  Registrado às 14:30            │
│  Prazo: até 23h59 de hoje       │
│                                 │
└─────────────────────────────────┘
```

### Tela 4 — Cardápio (Grade Semanal)
```
┌──────────────────────────────────────────────────────────────┐
│  CARDÁPIO DO ALMOÇO SEMANAL                                  │
├──────────┬─────────────┬─────────────┬──────────────┬───────┤
│ SEGUNDA  │ TERÇA       │ QUARTA      │ QUINTA       │ SEXTA │
├──────────┼─────────────┼─────────────┼──────────────┼───────┤
│ Arroz    │ Arroz com   │ Arroz com   │ Arroz com    │ Arroz │
│ com      │ carne,      │ peixe,      │ ovo, feijão  │ com   │
│ frango,  │ feijão e    │ feijão e    │ e salada     │lentilha│
│ feijão   │ legume      │ farofa      │              │       │
├──────────┴─────────────┴─────────────┴──────────────┴───────┤
│  [Editar] por dia (modal com textarea do prato)              │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. CRONOGRAMA / FASES DE IMPLEMENTAÇÃO (STATUS)

| Fase | Descrição | Status |
|------|-----------|--------|
| **1** | Estrutura de pastas + CSS base + dados de teste | ✅ Concluída |
| **2** | Banco local `database.js` (localStorage) + banco Firebase pronto | ✅ Concluída |
| **3** | Tela de Login + `auth.js` (sessão e perfil) | ✅ Concluída |
| **4** | Cadastro de Pessoas (CRUD completo) | ✅ Concluída |
| **5** | Cadastro de Usuários (Admin) | ✅ Concluída |
| **6** | Cardápio semanal (prato do almoço) | ✅ Concluída |
| **7** | Registro diário — tela Admin/Professor (SIM/NÃO) | ✅ Concluída |
| **8** | Confirmação do aluno — tela SIM/NÃO para celular | ✅ Concluída |
| **9** | Dashboard (resumo + cardápio do dia) | ✅ Concluída |
| **10** | Relatórios + Gráficos (Chart.js) | ✅ Concluída |
| **11** | Estilização completa + responsividade mobile | 🔄 Em andamento |
| **12** | Configurar banco online (Supabase) + Deploy no GitHub Pages | ✅ Concluída |
| **13** | Testes finais com a turma + ajustes | ⏳ Pendente |

---

## 10. DEPLOY E BANCO DE DADOS (CONCLUÍDO)

O sistema está **100% online**:

```
1. Conta Supabase (gratuita) → projeto gbeuvgsipxyodqyzsbdc (região São Paulo sa-east-1)
2. Schema aplicado: supabase/migrations/0001_init.sql (5 tabelas + RLS + grants)
3. Configuração em js/supabase-config.js (URL + chave publishable)
4. Adapter em js/database-supabase.js (API idêntica ao antigo database.js)
5. Seed idempotente em js/dados-iniciais.js (só grava se "admin" estiver vazio)
6. Repositório GitHub: ppiddj1-creator/Gestao_Alimentos
7. GitHub Pages publicando a raiz do repositório
8. Workflow .github/workflows/keep-alive.yml pinga a API a cada 5 dias
   (evita a pausa automática por 1 semana de inatividade do plano gratuito)
```

> **Segurança (aceito para demo acadêmica):** RLS habilitado com política aberta para a chave anon (pública por design); senhas em texto puro. Para produção real: Firebase Auth/Supabase Auth + políticas por usuário.

> **Limite gratuito do Supabase:** 500 MB de banco, 5 GB de egress/mês, 2 projetos ativos — folga de sobra para a escola.

---

## 11. REQUISITOS FUNCIONAIS

| ID | Requisito | Quem usa | Status |
|----|-----------|----------|--------|
| RF01 | Login com perfil de acesso (matrícula + senha) | Todos | ✅ |
| RF02 | Cadastrar pessoas (aluno, professor, funcionário) com matrícula única | Admin | ✅ |
| RF03 | Editar e excluir pessoas cadastradas | Admin | ✅ |
| RF04 | Buscar pessoa por nome, matrícula ou categoria | Admin/Professor | ✅ |
| RF05 | Aluno responde SIM/NÃO se vai almoçar no dia seguinte | Aluno | ✅ |
| RF06 | Professor/Admin registra resposta de qualquer pessoa | Professor/Admin | ✅ |
| RF07 | Prazo: resposta do aluno até 23h59 do dia anterior | Aluno | ✅ |
| RF08 | Aluno pode alterar a opção antes do prazo | Aluno | ✅ |
| RF09 | Exibir no dashboard quem respondeu SIM, NÃO e pendentes | Dashboard | ✅ |
| RF10 | Visualizar registros de datas anteriores | Admin/Professor | ✅ |
| RF11 | Cadastrar cardápio do almoço fixo por dia da semana (seg-sex) | Admin | ✅ |
| RF12 | Exibir cardápio da semana em formato grade | Todos | ✅ |
| RF13 | Exibir no dashboard e na tela do aluno o prato de amanhã | Todos | ✅ |
| RF14 | Gerar relatório de quantidades por dia | Admin/Professor | ✅ |
| RF15 | Gráfico de barras: últimos 7 dias (SIM vs NÃO) | Admin/Professor | ✅ |
| RF16 | Calcular taxa de aproveitamento | Admin/Professor | ✅ |
| RF17 | Cadastrar novos usuários (apenas Admin) | Admin | ✅ |
| RF18 | Controle de acesso por perfil (Admin/Professor/Aluno) | Sistema | ✅ |

---

## 12. REQUISITOS NÃO FUNCIONAIS

| ID | Requisito | Descrição |
|----|-----------|-----------|
| RNF01 | **Usabilidade** | Interface simples e intuitiva, fácil para qualquer perfil de usuário |
| RNF02 | **Responsividade** | Funcionar perfeitamente em computadores, tablets e celulares |
| RNF03 | **Armazenamento** | Hoje: localStorage. Futuro: Firebase Firestore (nuvem) |
| RNF04 | **Performance** | Resposta rápida, carregamento leve |
| RNF05 | **Segurança básica** | Senhas protegidas, controle de acesso por perfil |
| RNF06 | **Manutenibilidade** | Código modular, separado por funções, fácil de alterar |
| RNF07 | **Acessibilidade** | Textos legíveis, contraste adequado, navegação por teclado |
| RNF08 | **Portabilidade** | Funciona em qualquer navegador moderno (via Live Server) |
| RNF09 | **Disponibilidade** | Futuro: acessível de qualquer lugar com internet (GitHub Pages) |
| RNF10 | **Gratuidade** | Hospedagem e banco de dados gratuitos (local hoje; nuvem no futuro) |
| RNF11 | **Escalabilidade** | Suporta escolas com até 500 pessoas cadastradas |
| RNF12 | **Documentação** | Código organizado para fins didáticos |

---

## 13. COMO EXECUTAR O PROJETO

### No VS Code (recomendado)
1. Instalar a extensão **Live Server**
2. Abrir a pasta `Projeto PPI` no VS Code
3. Clicar com botão direito no `index.html` → **"Open with Live Server"**
4. O navegador abre em `http://127.0.0.1:5500`

### Sem Live Server
- Abrir o `index.html` diretamente no navegador (duplo clique)
- ⚠️ Cuidado: o `localStorage` pode não funcionar em alguns navegadores quando aberto direto do disco

### Testar o sistema
- Login: `admin` / `admin`
- Ou entrar como aluno: `2026001` / `123456`

### Limpar dados de teste
- Abrir as DevTools (F12) → Console → digitar `localStorage.clear()` → F5

---

*Documento atualizado em 08/09/2026 — reflete o estado atual do projeto (sistema de almoço simplificado com resposta SIM/NÃO, funcionando 100% local com localStorage)*