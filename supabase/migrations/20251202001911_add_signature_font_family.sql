alter table public.signatures
add column if not exists font_family text not null default 'Arial, sans-serif';
