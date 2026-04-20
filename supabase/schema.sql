-- =============================================
-- THINQ SUPABASE SCHEMA
-- Paste this entire file into Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
create table public.users (
  id uuid default uuid_generate_v4() primary key,
  email text,
  created_at timestamptz default now() not null,
  onboarding_complete boolean default false not null,
  display_name text
);

alter table public.users enable row level security;

create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create index users_email_idx on public.users(email);

-- =============================================
-- SESSIONS TABLE
-- =============================================
create table public.sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  started_at timestamptz default now() not null,
  ended_at timestamptz,
  duration_minutes integer,
  session_type text not null check (session_type in ('text', 'voice')) default 'text',
  time_available_minutes integer not null,
  opening_question text,
  summary_3_lines text,
  full_transcript jsonb default '[]'::jsonb not null,
  tags text[] default '{}'::text[] not null
);

alter table public.sessions enable row level security;

create policy "Users can view own sessions" on public.sessions
  for select using (auth.uid() = user_id);

create policy "Users can create own sessions" on public.sessions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own sessions" on public.sessions
  for update using (auth.uid() = user_id);

create policy "Users can delete own sessions" on public.sessions
  for delete using (auth.uid() = user_id);

create index sessions_user_id_idx on public.sessions(user_id);
create index sessions_started_at_idx on public.sessions(started_at desc);
create index sessions_tags_idx on public.sessions using gin(tags);

-- =============================================
-- USER_MEMORY TABLE
-- Persistent facts the AI learns about the user
-- =============================================
create table public.user_memory (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  key text not null,
  value text not null,
  last_updated timestamptz default now() not null,
  unique(user_id, key)
);

alter table public.user_memory enable row level security;

create policy "Users can view own memory" on public.user_memory
  for select using (auth.uid() = user_id);

create policy "Users can insert own memory" on public.user_memory
  for insert with check (auth.uid() = user_id);

create policy "Users can update own memory" on public.user_memory
  for update using (auth.uid() = user_id);

create policy "Users can delete own memory" on public.user_memory
  for delete using (auth.uid() = user_id);

create index user_memory_user_id_idx on public.user_memory(user_id);
create index user_memory_key_idx on public.user_memory(key);

-- =============================================
-- PATTERNS TABLE
-- Repeated themes/thoughts detected across sessions
-- =============================================
create table public.patterns (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  pattern_text text not null,
  first_seen timestamptz default now() not null,
  last_seen timestamptz default now() not null,
  occurrence_count integer default 1 not null,
  unique(user_id, pattern_text)
);

alter table public.patterns enable row level security;

create policy "Users can view own patterns" on public.patterns
  for select using (auth.uid() = user_id);

create policy "Users can insert own patterns" on public.patterns
  for insert with check (auth.uid() = user_id);

create policy "Users can update own patterns" on public.patterns
  for update using (auth.uid() = user_id);

create policy "Users can delete own patterns" on public.patterns
  for delete using (auth.uid() = user_id);

create index patterns_user_id_idx on public.patterns(user_id);
create index patterns_occurrence_count_idx on public.patterns(occurrence_count desc);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Update pattern occurrence (called when new session completes)
create or replace function public.update_pattern(
  p_user_id uuid,
  p_pattern_text text
) returns void as $$
begin
  insert into public.patterns (user_id, pattern_text)
  values (p_user_id, p_pattern_text)
  on conflict (user_id, pattern_text) do update set
    last_seen = now(),
    occurrence_count = patterns.occurrence_count + 1;
end;
$$ language plpgsql security definer;

-- Update user memory (upsert pattern)
create or replace function public.upsert_user_memory(
  p_user_id uuid,
  p_key text,
  p_value text
) returns void as $$
begin
  insert into public.user_memory (user_id, key, value)
  values (p_user_id, p_key, p_value)
  on conflict (user_id, key) do update set
    value = p_value,
    last_updated = now();
end;
$$ language plpgsql security definer;

-- Search sessions by tags or content
create or replace function public.search_sessions(
  p_user_id uuid,
  p_query text
) returns table (
  id uuid,
  started_at timestamptz,
  duration_minutes integer,
  session_type text,
  summary_3_lines text,
  tags text[],
  matched_content text
) as $$
begin
  return query
  select
    s.id,
    s.started_at,
    s.duration_minutes,
    s.session_type,
    s.summary_3_lines,
    s.tags,
    m.content as matched_content
  from public.sessions s
  cross join lateral (
    select content from jsonb_array_elements(s.full_transcript) elem
    where elem->>'content' ilike '%' || p_query || '%'
    limit 1
  ) m
  where s.user_id = p_user_id
  order by s.started_at desc;
end;
$$ language plpgsql security definer;

-- Get user memory as key-value object
create or replace function public.get_user_memory_map(
  p_user_id uuid
) returns json as $$
declare
  result json;
begin
  select json_object_agg(key, value)
  into result
  from public.user_memory
  where user_id = p_user_id;
  return coalesce(result, '{}'::json);
end;
$$ language plpgsql security definer;