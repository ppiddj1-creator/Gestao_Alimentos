-- 0002_pessoas_data_nascimento.sql
-- Armazena a data de nascimento da pessoa (usada como senha no cadastro automatizado).
-- A senha continua na coluna "senha" (formato ddmmaaaa); esta coluna guarda a data original.

alter table public.pessoas add column if not exists "dataNascimento" text;
