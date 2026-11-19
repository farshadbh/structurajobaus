-- Supabase / Postgres schema for the jobs portal.
-- Run this when connecting Supabase, then replace the function bodies in lib/jobs.ts.

create type job_sector as enum ('academic');
create type work_arrangement as enum ('onsite', 'hybrid', 'remote');
create type employment_type as enum ('full-time', 'part-time', 'contract', 'scholarship');

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  role_slug text not null,
  sector job_sector not null,
  organisation text not null,
  department text,
  city text not null,
  state text not null check (state in ('NSW','VIC','QLD','WA','SA','TAS','ACT','NT')),
  location text not null,
  salary_min integer not null check (salary_min >= 0),
  salary_max integer not null check (salary_max >= salary_min),
  salary_period text not null default 'year' check (salary_period in ('year', 'scholarship')),
  employment_type employment_type not null,
  work_arrangement work_arrangement not null,
  visa_sponsorship boolean not null default false,
  featured boolean not null default false,
  posted_at date not null default current_date,
  closing_date date not null,
  summary text not null,
  description text not null,
  responsibilities text[] not null default '{}',
  requirements text[] not null default '{}',
  tags text[] not null default '{}',
  apply_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists jobs_sector_posted_idx on public.jobs (sector, posted_at desc);
create index if not exists jobs_city_idx on public.jobs (city);
create index if not exists jobs_role_idx on public.jobs (role_slug);

alter table public.jobs enable row level security;

-- Job listings are public; inserts/updates should go through an authenticated admin role.
create policy "Jobs are publicly readable" on public.jobs
  for select using (true);
