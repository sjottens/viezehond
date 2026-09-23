-- Viezehond webshop: voer dit één keer uit in Supabase > SQL Editor

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
    check (status in ('open', 'paid', 'shipped', 'failed', 'canceled', 'expired')),
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

-- Zet een bestelling op betaald en haal de voorraad eraf.
-- Veilig om vaker aan te roepen: de voorraad wordt maar één keer afgeboekt.
create or replace function mark_order_paid(p_order_id uuid)
returns void
language plpgsql
as $$
begin
  update orders
     set status = 'paid', paid_at = now(), stock_deducted = true
   where id = p_order_id and stock_deducted = false;

  if found then
    update products p
       set stock = greatest(p.stock - oi.quantity, 0)
      from order_items oi
     where oi.order_id = p_order_id and oi.product_id = p.id;
  end if;
end;
$$;

-- Opslag voor productfoto's (openbaar leesbaar)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
