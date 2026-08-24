-- ============================================================================
-- WoodHub — full database schema
-- Supabase -> SQL Editor -> paste -> Run. Dobara chalane par bhi safe hai.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- categories
create table if not exists public.categories (
  slug        text primary key,
  label       text not null,
  title       text not null,
  blurb       text not null default '',
  cover       text not null default '',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------------ products
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  category      text not null references public.categories(slug) on update cascade,
  price         integer not null check (price >= 0),
  compare_at    integer,
  wood          text not null default '',
  dimensions    text not null default '',
  finish        text not null default '',
  wood_note     text not null default '',
  description   text not null default '',
  features      jsonb not null default '[]'::jsonb,
  rating        numeric(2,1) not null default 5.0 check (rating between 0 and 5),
  reviews_count integer not null default 0 check (reviews_count >= 0),
  stock         integer not null default 0 check (stock >= 0),
  sku           text not null default '',
  image         text not null default '',
  featured      boolean not null default false,
  personalised  boolean not null default false,
  active        boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_active_idx   on public.products (active);
create index if not exists products_stock_idx    on public.products (stock);

-- ----------------------------------------------------------------- customers
create table if not exists public.customers (
  id             uuid primary key default gen_random_uuid(),
  email          text unique not null,
  name           text not null default '',
  phone          text not null default '',
  city           text not null default '',
  address        text not null default '',
  google_sub     text,
  orders_count   integer not null default 0,
  total_spent    integer not null default 0,
  first_order_at timestamptz,
  last_order_at  timestamptz,
  created_at     timestamptz not null default now()
);

create index if not exists customers_last_order_idx on public.customers (last_order_at desc nulls last);

-- -------------------------------------------------------------------- orders
do $$ begin
  create type order_status as enum (
    'awaiting-verification', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    text unique not null,
  status          order_status not null default 'confirmed',
  customer        jsonb not null,
  customer_id     uuid references public.customers(id) on delete set null,
  account_sub     text,
  payment_method  text not null,
  payment_txn_id  text not null default '',
  payment_verified_at timestamptz,
  lines           jsonb not null,
  item_count      integer not null default 0,
  subtotal        integer not null,
  shipping        integer not null default 0,
  cod_fee         integer not null default 0,
  total           integer not null,
  admin_notes     text not null default '',
  tracking_number text not null default '',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists orders_created_idx  on public.orders (created_at desc);
create index if not exists orders_status_idx   on public.orders (status);
create index if not exists orders_customer_idx on public.orders (customer_id);
create index if not exists orders_account_idx  on public.orders (account_sub);
create index if not exists orders_email_idx    on public.orders ((customer->>'email'));

-- ------------------------------------------------------------ updated_at bump
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- Functions
-- ============================================================================

-- Stock atomically kam karta hai. Order place hone par call hota hai.
create or replace function public.apply_stock(p_lines jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
begin
  for item in select * from jsonb_array_elements(p_lines)
  loop
    update public.products
       set stock = greatest(0, stock - (item->>'qty')::int)
     where slug = item->>'slug';
  end loop;
end $$;

-- Order cancel hone par stock wapas.
create or replace function public.restore_stock(p_lines jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
begin
  for item in select * from jsonb_array_elements(p_lines)
  loop
    update public.products
       set stock = stock + (item->>'qty')::int
     where slug = item->>'slug';
  end loop;
end $$;

-- Customer record banata ya update karta hai, counters ke saath.
create or replace function public.record_customer(
  p_email text, p_name text, p_phone text, p_city text,
  p_address text, p_sub text, p_total integer, p_when timestamptz
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  cid uuid;
begin
  insert into public.customers (email, name, phone, city, address, google_sub,
                                orders_count, total_spent, first_order_at, last_order_at)
  values (lower(p_email), p_name, p_phone, p_city, p_address, p_sub, 1, p_total, p_when, p_when)
  on conflict (email) do update
    set name          = coalesce(nullif(excluded.name, ''), customers.name),
        phone         = coalesce(nullif(excluded.phone, ''), customers.phone),
        city          = coalesce(nullif(excluded.city, ''), customers.city),
        address       = coalesce(nullif(excluded.address, ''), customers.address),
        google_sub    = coalesce(excluded.google_sub, customers.google_sub),
        orders_count  = customers.orders_count + 1,
        total_spent   = customers.total_spent + excluded.total_spent,
        last_order_at = excluded.last_order_at
  returning id into cid;
  return cid;
end $$;

-- Dashboard ke saare numbers ek round trip me.
create or replace function public.admin_dashboard(p_days integer default 30)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  since  timestamptz := now() - (p_days || ' days')::interval;
  prev   timestamptz := now() - ((p_days * 2) || ' days')::interval;
  result jsonb;
begin
  select jsonb_build_object(
    'range_days', p_days,

    'revenue', coalesce((select sum(total) from public.orders
                          where created_at >= since and status <> 'cancelled'), 0),
    'revenue_prev', coalesce((select sum(total) from public.orders
                          where created_at >= prev and created_at < since
                            and status <> 'cancelled'), 0),

    'orders', (select count(*) from public.orders where created_at >= since),
    'orders_prev', (select count(*) from public.orders
                     where created_at >= prev and created_at < since),

    'items_sold', coalesce((select sum(item_count) from public.orders
                             where created_at >= since and status <> 'cancelled'), 0),

    'customers', (select count(*) from public.customers),
    'new_customers', (select count(*) from public.customers where first_order_at >= since),

    'awaiting', (select count(*) from public.orders where status = 'awaiting-verification'),
    'to_ship',  (select count(*) from public.orders where status in ('confirmed','packed')),

    'by_status', coalesce((
      select jsonb_object_agg(s.status, s.n) from (
        select status::text as status, count(*) as n
          from public.orders where created_at >= since group by status
      ) s), '{}'::jsonb),

    'by_payment', coalesce((
      select jsonb_object_agg(p.payment_method, p.n) from (
        select payment_method, count(*) as n
          from public.orders where created_at >= since group by payment_method
      ) p), '{}'::jsonb),

    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('day', series.day, 'revenue', series.rev, 'orders', series.cnt)
                       order by series.day)
      from (
        select d::date as day,
               coalesce(sum(o.total) filter (where o.status <> 'cancelled'), 0)::int as rev,
               count(o.id)::int as cnt
          from generate_series(since::date, now()::date, '1 day') d
          left join public.orders o on date_trunc('day', o.created_at)::date = d::date
         group by d
      ) series), '[]'::jsonb),

    'top_products', coalesce((
      select jsonb_agg(t) from (
        select line->>'slug' as slug,
               line->>'name' as name,
               sum((line->>'qty')::int)::int as qty,
               sum((line->>'lineTotal')::int)::int as revenue
          from public.orders o, jsonb_array_elements(o.lines) line
         where o.created_at >= since and o.status <> 'cancelled'
         group by 1, 2
         order by revenue desc
         limit 8
      ) t), '[]'::jsonb),

    'low_stock', coalesce((
      select jsonb_agg(l) from (
        select slug, name, stock from public.products
         where active and stock <= 5 order by stock asc limit 8
      ) l), '[]'::jsonb)
  ) into result;

  return result;
end $$;

-- ============================================================================
-- Row Level Security
-- Site server-side service-role key use karti hai, jo RLS bypass karta hai.
-- Anon key se sirf active products aur categories parhe ja sakte hain.
-- Orders aur customers browser se bilkul readable nahi.
-- ============================================================================

alter table public.products   enable row level security;
alter table public.categories enable row level security;
alter table public.orders     enable row level security;
alter table public.customers  enable row level security;

drop policy if exists "public reads active products" on public.products;
create policy "public reads active products" on public.products
  for select using (active = true);

drop policy if exists "public reads categories" on public.categories;
create policy "public reads categories" on public.categories
  for select using (true);

-- orders aur customers par koi public policy nahi = koi public access nahi.
