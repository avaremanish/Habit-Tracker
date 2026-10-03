-- ============================================================================
-- CONSIST MULTI-USER POSTGRES SCHEMA (SUPABASE MIGRATION 20261004000000)
-- ============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  avatar_url text,
  timezone text not null default 'UTC',
  week_start_day smallint not null default 1, -- 0 = Sun, 1 = Mon
  freeze_tokens_remaining int not null default 3,
  max_freeze_tokens int not null default 3,
  auto_freeze_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. HABITS
create table if not exists public.habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  category text not null default 'Health',
  description text,
  frequency text not null default 'daily', -- 'daily', 'specific_days', 'x_times_week'
  target_days_per_week smallint,
  specific_days smallint[], -- array of weekday numbers [1, 2, 3, 4, 5]
  is_measurable boolean not null default false,
  target_value numeric,
  target_unit text,
  time_of_day text not null default 'morning',
  color text default '#06b6d4',
  icon text,
  sort_order int not null default 0,
  is_paused boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. HABIT LOGS (Check-ins)
create table if not exists public.habit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  local_date date not null, -- Stored as YYYY-MM-DD to avoid timezone drift
  status text not null check (status in ('completed', 'missed', 'skipped', 'frozen', 'partial', 'pending')),
  current_value numeric,
  target_value numeric,
  note text,
  logged_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_habit_local_date unique (habit_id, local_date)
);

-- 4. STREAK FREEZES
create table if not exists public.streak_freezes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  habit_id uuid references public.habits(id) on delete cascade,
  local_date date not null,
  reason text,
  used_at timestamptz not null default now()
);

-- 5. TASKS
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  habit_id uuid references public.habits(id) on delete set null,
  title text not null,
  due_date date not null,
  completed boolean not null default false,
  priority text not null default 'medium',
  category text not null default 'Work',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. GOALS
create table if not exists public.goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  area_id text not null,
  title text not null,
  category text not null default 'Personal',
  current_value numeric default 0,
  target_value numeric,
  unit text,
  target_date date not null,
  connected_habit_ids uuid[] default '{}',
  status text not null default 'in_progress',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. MINDSET LOGS
create table if not exists public.mindset_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  local_date date not null,
  energy smallint not null check (energy between 1 and 10),
  focus smallint not null check (focus between 1 and 10),
  motivation smallint not null check (motivation between 1 and 10),
  note text,
  created_at timestamptz not null default now(),
  constraint unique_user_mindset_date unique (user_id, local_date)
);

-- 8. WEEKLY REVIEWS
create table if not exists public.weekly_reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_start_date date not null,
  completion_rate numeric not null,
  consistency_score numeric not null,
  momentum_percent numeric not null,
  strongest_habit_name text,
  attention_habit_name text,
  worked_well text,
  impediments text,
  changes_next_week text,
  saved_at timestamptz not null default now(),
  constraint unique_user_week_review unique (user_id, week_start_date)
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.streak_freezes enable row level security;
alter table public.tasks enable row level security;
alter table public.goals enable row level security;
alter table public.mindset_logs enable row level security;
alter table public.weekly_reviews enable row level security;

-- Profiles RLS
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Habits RLS
drop policy if exists "Users manage own habits" on public.habits;
create policy "Users manage own habits" on public.habits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Habit Logs RLS
drop policy if exists "Users manage own logs" on public.habit_logs;
create policy "Users manage own logs" on public.habit_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Streak Freezes RLS
drop policy if exists "Users manage own streak freezes" on public.streak_freezes;
create policy "Users manage own streak freezes" on public.streak_freezes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Tasks RLS
drop policy if exists "Users manage own tasks" on public.tasks;
create policy "Users manage own tasks" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Goals RLS
drop policy if exists "Users manage own goals" on public.goals;
create policy "Users manage own goals" on public.goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Mindset Logs RLS
drop policy if exists "Users manage own mindset logs" on public.mindset_logs;
create policy "Users manage own mindset logs" on public.mindset_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Weekly Reviews RLS
drop policy if exists "Users manage own weekly reviews" on public.weekly_reviews;
create policy "Users manage own weekly reviews" on public.weekly_reviews for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.email, ''),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- SERVER-ENFORCED ATOMIC STREAK FREEZE FUNCTION
-- ============================================================================
create or replace function public.use_freeze_token(
  p_habit_id uuid,
  p_local_date date,
  p_reason text default 'Planned Rest Day / Travel'
)
returns json as $$
declare
  v_user_id uuid := auth.uid();
  v_remaining int;
begin
  if v_user_id is null then
    return json_build_object('success', false, 'message', 'Unauthorized');
  end if;

  -- Check user remaining freeze tokens
  select freeze_tokens_remaining into v_remaining
  from public.profiles
  where id = v_user_id;

  if v_remaining is null or v_remaining <= 0 then
    return json_build_object('success', false, 'message', 'No freeze tokens remaining');
  end if;

  -- Deduct one token
  update public.profiles
  set freeze_tokens_remaining = freeze_tokens_remaining - 1,
      updated_at = now()
  where id = v_user_id;

  -- Record freeze history
  insert into public.streak_freezes (user_id, habit_id, local_date, reason)
  values (v_user_id, p_habit_id, p_local_date, p_reason);

  -- Upsert habit log as frozen
  insert into public.habit_logs (user_id, habit_id, local_date, status)
  values (v_user_id, p_habit_id, p_local_date, 'frozen')
  on conflict (habit_id, local_date)
  do update set status = 'frozen', updated_at = now();

  return json_build_object('success', true, 'tokensRemaining', v_remaining - 1);
end;
$$ language plpgsql security definer;
