-- 0003_pessoas_login.sql — Login = 2 primeiros nomes (ex.: DavidsonOliveira)
-- A senha continua sendo a data de nascimento apenas com números (ddmmaaaa).

alter table public.pessoas add column if not exists login text;
create index if not exists idx_pessoas_login on public.pessoas (login);
