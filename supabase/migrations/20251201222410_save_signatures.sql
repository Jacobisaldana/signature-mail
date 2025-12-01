-- Save user-created signatures with metadata for quick lookup/editing
create table if not exists public.signatures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) <= 150),
  label text not null check (char_length(label) <= 80),
  template_id text not null check (template_id in ('modern', 'minimalist', 'classic', 'vertical', 'compact', 'social-focus')),
  form_data jsonb not null,
  colors jsonb not null,
  image_url text,
  html text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.signatures is 'Saved email signatures per user (name, label, html, and raw form data)';
comment on column public.signatures.label is 'User-defined tag, e.g. Personal/Work';

create index if not exists signatures_user_id_idx on public.signatures (user_id, created_at desc);

alter table public.signatures enable row level security;

-- Update timestamp on every write
create or replace function public.set_signatures_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists signatures_set_updated_at on public.signatures;
create trigger signatures_set_updated_at
before update on public.signatures
for each row
execute procedure public.set_signatures_updated_at();

-- Policies: users can CRUD only their own signatures
create policy "Users can view their signatures"
on public.signatures
for select
using (auth.uid() = user_id);

create policy "Users can insert their signatures"
on public.signatures
for insert
with check (auth.uid() = user_id);

create policy "Users can update their signatures"
on public.signatures
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their signatures"
on public.signatures
for delete
using (auth.uid() = user_id);
