-- Viezehond webshop: voer dit uit in Supabase > SQL Editor.
-- Veilig om opnieuw uit te voeren: bestaande tabellen worden bijgewerkt, data blijft staan.

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null default '',
  price_cents integer not null check (price_cents >= 0),   -- prijs incl. btw, in centen
  stock integer not null default 0 check (stock >= 0),
  category text not null default 'accessoires',
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  number bigint generated always as identity (start with 1001),
  status text not null default 'open'
    check (status in ('open', 'paid', 'shipped', 'failed', 'canceled', 'expired', 'refunded')),
  email text not null,
  name text not null,
  street text not null,
  postal_code text not null,
  city text not null,
  country text not null default 'NL',
  phone text,
  subtotal_cents integer not null,
  shipping_cents integer not null,
  total_cents integer not null,
  mollie_payment_id text unique,
  stock_deducted boolean not null default false,
  stock_issue boolean not null default false,       -- te weinig voorraad bij betaling
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  shipped_at timestamptz
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  name text not null,
  unit_price_cents integer not null,
  quantity integer not null check (quantity > 0)
);

create index if not exists order_items_order_idx on order_items(order_id);

-- Alle toegang loopt via de server (service role key).
-- Row Level Security aan zonder policies = niemand kan direct vanuit de browser bij de data.
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Bijwerken van een bestaande database (van vóór september 2026)
alter table orders add column if not exists stock_issue boolean not null default false;
alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check
  check (status in ('open', 'paid', 'shipped', 'failed', 'canceled', 'expired', 'refunded'));

-- Zet een bestelling op betaald en haal de voorraad eraf.
-- Veilig om vaker aan te roepen: de voorraad wordt maar één keer afgeboekt.
-- Was er te weinig voorraad (twee klanten kochten tegelijk het laatste stuk), dan krijgt
-- de bestelling stock_issue = true en zie je een waarschuwing in het beheer.
create or replace function public.mark_order_paid(p_order_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
begin
  update public.orders
     set status = 'paid', paid_at = now(), stock_deducted = true
   where id = p_order_id and stock_deducted = false;

  if found then
    update public.orders
       set stock_issue = true
     where id = p_order_id
       and exists (
         select 1 from public.order_items oi
           join public.products p on p.id = oi.product_id
          where oi.order_id = p_order_id and p.stock < oi.quantity
       );

    update public.products p
       set stock = greatest(p.stock - oi.quantity, 0)
      from public.order_items oi
     where oi.order_id = p_order_id and oi.product_id = p.id;
  end if;
end;
$$;

-- Alleen de server (service role) mag deze functie aanroepen
revoke execute on function public.mark_order_paid(uuid) from public, anon, authenticated;
grant execute on function public.mark_order_paid(uuid) to service_role;

-- Opslag voor productfoto's (openbaar leesbaar)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
