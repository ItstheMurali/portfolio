-- ============================================================
-- Murali Krishna Kolipaka — Portfolio CMS schema
-- Run this once in the Supabase SQL editor.
-- ============================================================

-- Shared trigger to maintain updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------- identity (single row) ----------
create table if not exists identity (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'MURALI KRISHNA KOLIPAKA',
  title text not null default 'Senior Technical Writer | Information Architect | AI Builder',
  tagline text not null default 'Complexity has always existed. Clarity is a choice.',
  thesis text not null default 'I don''t organize information. I design how understanding moves.',
  progression text not null default 'Technical Writer → Information Architect → AI Builder → Storyteller',
  status text not null default 'Open for opportunities and collaborations in AI and Technical Writing',
  email text not null default 'muralikrishna0293@gmail.com',
  linkedin text not null default 'https://linkedin.com/in/murali-krishna66',
  resume_url text not null default '/Murali_Krishna_Resume.pdf',
  open_for jsonb not null default '["Senior Technical Writer roles","Information Architecture projects","AI documentation tool collaboration","Filmmaking and creative projects"]',
  whisper text not null default 'Technical Writer. Information Architect. AI Builder. Filmmaker.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- counters ----------
create table if not exists counters (
  id uuid primary key default gen_random_uuid(),
  value text not null,
  label text not null,
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- cases ----------
create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  domain text not null default '',
  problem text not null default '',
  insight text not null default '',
  result text not null default '',
  impact text not null default '',
  diagram text not null default 'architecture',
  kind text not null default 'work',
  org text default '',
  period text default '',
  role text default '',
  stack jsonb not null default '[]',
  featured boolean not null default false,
  full_description text default '',
  decisions text default '',
  artifacts text default '',
  lessons text default '',
  process_steps jsonb default '[]',
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- tools ----------
create table if not exists tools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  stack jsonb not null default '[]',
  description text not null default '',
  details text default '',
  impact text not null default '',
  visual text not null default 'transform',
  demo_url text default '',
  case_slug text default '',
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- films ----------
create table if not exists films (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  genre text not null default '',
  description text not null default '',
  lesson text not null default '',
  youtube_url text not null default '',
  tools jsonb not null default '[]',
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- work categories ----------
create table if not exists work_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  details text default '',
  impact text default '',
  samples jsonb not null default '[]',
  samples_label text default '',
  case_slug text default '',
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- copy (every prose line, keyed) ----------
create table if not exists copy (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null default '',
  section text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- theme ----------
create table if not exists theme (
  id uuid primary key default gen_random_uuid(),
  bg text not null default '#0A0A0F',
  bg_darker text not null default '#080810',
  bg_warm text not null default '#0D0A08',
  chaos text not null default '#4A5568',
  pen text not null default '#E8D5A3',
  clarity text not null default '#C8D8FF',
  human text not null default '#F5F0E8',
  motion_intensity numeric not null default 1.0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- scenes (section order + visibility) ----------
create table if not exists scenes (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- triggers ----------
do $$
declare t text;
begin
  foreach t in array array['identity','counters','cases','tools','films','work_categories','copy','theme','scenes']
  loop
    execute format('drop trigger if exists %I_updated on %I', t, t);
    execute format('create trigger %I_updated before update on %I for each row execute function set_updated_at()', t, t);
  end loop;
end $$;

-- ---------- row level security ----------
-- Public (anon) can READ everything; only authenticated users can WRITE.
do $$
declare t text;
begin
  foreach t in array array['identity','counters','cases','tools','films','work_categories','copy','theme','scenes']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "%s_read" on %I', t, t);
    execute format('create policy "%s_read" on %I for select using (true)', t, t);
    execute format('drop policy if exists "%s_write" on %I', t, t);
    execute format('create policy "%s_write" on %I for all to authenticated using (true) with check (true)', t, t);
  end loop;
end $$;

-- ---------- seed data ----------
insert into identity default values on conflict do nothing;

insert into counters (value, label, sort_order) values
  ('250+', 'Countries documented at Google scale.', 0),
  ('99.64%', 'Quality score. At Google velocity.', 1),
  ('5', 'Tools built. Without being asked.', 2)
on conflict do nothing;

insert into scenes (key, label, sort_order) values
  ('storm', 'The Storm', 0),
  ('scale', 'The Scale', 1),
  ('work', 'The Work', 2),
  ('architecture', 'The Architecture', 3),
  ('tools', 'The Tools', 4),
  ('impact', 'Impact Dashboard', 5),
  ('standards', 'The Standards', 6),
  ('api', 'The API Demo', 7),
  ('built', 'Built With Intention', 8),
  ('films', 'The Dimension', 9),
  ('contact', 'The Invitation', 10)
on conflict (key) do nothing;

insert into theme default values on conflict do nothing;
