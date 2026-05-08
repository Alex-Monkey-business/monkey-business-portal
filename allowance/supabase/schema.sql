-- Ukelønns-app: database-skjema
-- Kjør dette i Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- Barn
create table if not exists children (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#fbbf24', -- avatar-farge
  weekly_amount numeric(10, 2) not null default 0, -- fast ukelønn (NOK)
  created_at timestamptz not null default now()
);

-- Oppgaver (mal — gjentas hver uke)
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  title text not null,
  reward numeric(10, 2) not null default 0, -- belønning per fullført gang (NOK)
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Fullføringer av oppgaver (én rad per gang en oppgave hukes av)
create table if not exists task_completions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  completed_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique (task_id, completed_on)
);

-- Sparemål
create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  title text not null,
  target_amount numeric(10, 2) not null,
  saved_amount numeric(10, 2) not null default 0,
  achieved_at timestamptz,
  created_at timestamptz not null default now()
);

-- Transaksjoner (alt som påvirker saldo)
create type transaction_kind as enum ('weekly', 'task', 'bonus', 'spend', 'adjust');

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  amount numeric(10, 2) not null, -- positiv = tjent, negativ = brukt
  kind transaction_kind not null,
  note text,
  task_id uuid references tasks(id) on delete set null,
  goal_id uuid references goals(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists transactions_child_created_idx
  on transactions (child_id, created_at desc);

-- View: gjeldende saldo per barn
create or replace view child_balances as
select
  c.id as child_id,
  c.name,
  coalesce(sum(t.amount), 0)::numeric(10, 2) as balance
from children c
left join transactions t on t.child_id = c.id
group by c.id, c.name;

-- Enkelt oppsett uten innlogging: åpne policies (alle kan lese/skrive).
-- Bytt ut når du legger til Supabase Auth.
alter table children enable row level security;
alter table tasks enable row level security;
alter table task_completions enable row level security;
alter table goals enable row level security;
alter table transactions enable row level security;

create policy "open access" on children for all using (true) with check (true);
create policy "open access" on tasks for all using (true) with check (true);
create policy "open access" on task_completions for all using (true) with check (true);
create policy "open access" on goals for all using (true) with check (true);
create policy "open access" on transactions for all using (true) with check (true);
