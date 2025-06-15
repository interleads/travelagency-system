
-- Tabela de categorias
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone default now()
);

-- Tabela de produtos
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default now()
);

-- Ativar RLS
alter table public.categories enable row level security;
alter table public.products enable row level security;

-- Políticas para permitir acesso total a usuários autenticados (ajuste conforme necessário)
create policy "Authenticated can select categories" on public.categories for select using (auth.role() = 'authenticated');
create policy "Authenticated can insert categories" on public.categories for insert with check (auth.role() = 'authenticated');
create policy "Authenticated can update categories" on public.categories for update using (auth.role() = 'authenticated');
create policy "Authenticated can delete categories" on public.categories for delete using (auth.role() = 'authenticated');

create policy "Authenticated can select products" on public.products for select using (auth.role() = 'authenticated');
create policy "Authenticated can insert products" on public.products for insert with check (auth.role() = 'authenticated');
create policy "Authenticated can update products" on public.products for update using (auth.role() = 'authenticated');
create policy "Authenticated can delete products" on public.products for delete using (auth.role() = 'authenticated');
