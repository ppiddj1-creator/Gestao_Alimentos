-- 0001_init.sql — Schema inicial: Sistema de Gestão Alimentar Escolar
-- Espelha as coleções do localStorage: admin, pessoas, cardapio, registros, usuarios
-- Colunas em camelCase (idênticas ao JS) para zero mapeamento no adapter.

create table if not exists public.admin (
  id text primary key,
  nome text,
  usuario text,
  senha text,
  perfil text
);

create table if not exists public.pessoas (
  id text primary key,
  nome text,
  categoria text,
  "turmaSetor" text,
  matricula text,
  senha text,
  telefone text,
  "criadoEm" text
);

create table if not exists public.cardapio (
  id text primary key,
  "diaSemana" text,
  prato text
);

create table if not exists public.registros (
  id text primary key,
  data text,
  "pessoaId" text,
  "vaiAlmocar" boolean,
  "registradoPor" text,
  "registradoEm" text
);

create table if not exists public.usuarios (
  id text primary key,
  usuario text,
  senha text,
  nome text,
  perfil text,
  "pessoaId" text,
  "criadoEm" text
);

-- Índices para as buscas frequentes
create index if not exists idx_pessoas_matricula on public.pessoas (matricula);
create index if not exists idx_usuarios_usuario on public.usuarios (usuario);
create index if not exists idx_registros_data on public.registros (data);
create index if not exists idx_registros_pessoa on public.registros ("pessoaId");

-- Privilégios para a API pública (chave anon)
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;

-- RLS habilitado com política aberta (projeto acadêmico / demo)
alter table public.admin enable row level security;
alter table public.pessoas enable row level security;
alter table public.cardapio enable row level security;
alter table public.registros enable row level security;
alter table public.usuarios enable row level security;

create policy "acesso_total_demo" on public.admin
  for all to anon, authenticated using (true) with check (true);
create policy "acesso_total_demo" on public.pessoas
  for all to anon, authenticated using (true) with check (true);
create policy "acesso_total_demo" on public.cardapio
  for all to anon, authenticated using (true) with check (true);
create policy "acesso_total_demo" on public.registros
  for all to anon, authenticated using (true) with check (true);
create policy "acesso_total_demo" on public.usuarios
  for all to anon, authenticated using (true) with check (true);
