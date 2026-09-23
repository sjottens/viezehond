import type { Order, OrderItem, Product } from '../types';

// Nepdata voor de lokale demo. Houd dit gelijk met supabase/seed.sql.
const P: Omit<Product, 'id' | 'created_at' | 'image_url' | 'active'>[] = [
  { slug: 'metalen-kam-fijn-grof', name: 'Metalen kam fijn/grof', category: 'kammen', price_cents: 1295, stock: 40,
    description: 'Stevige kam met twee tandafstanden. De grove kant voor het ontwarren, de fijne kant voor het afwerken.' },
  { slug: 'slickerborstel', name: 'Slickerborstel', category: 'kammen', price_cents: 1750, stock: 25,
    description: 'Verwijdert losse ondervacht en kleine klitten. Geschikt voor middellange en lange vachten.' },
  { slug: 'ontklitkam', name: 'Ontklitkam', category: 'kammen', price_cents: 1495, stock: 3,
    description: 'Met afgeronde messen die klitten doorsnijden zonder aan de huid te trekken.' },
  { slug: 'borstelhandschoen', name: 'Borstelhandschoen', category: 'kammen', price_cents: 995, stock: 50,
    description: 'Rubberen noppen die losse haren en opgedroogde modder meenemen. Voelt voor je hond als een aai.' },
  { slug: 'milde-hondenshampoo-250', name: 'Milde hondenshampoo 250 ml', category: 'shampoo', price_cents: 1195, stock: 60,
    description: 'Parfumvrije shampoo met een neutrale pH, ook voor gevoelige huid.' },
  { slug: 'anti-klit-conditioner-250', name: 'Anti-klit conditioner 250 ml', category: 'shampoo', price_cents: 1295, stock: 45,
    description: 'Maakt de vacht soepel en makkelijker te kammen na het wassen.' },
  { slug: 'droogshampoo-spray', name: 'Droogshampoo spray 200 ml', category: 'shampoo', price_cents: 1095, stock: 0,
    description: 'Voor tussendoor: opsprayen, inmasseren en uitborstelen. Zonder water.' },
  { slug: 'microvezel-badhanddoek', name: 'Microvezel badhanddoek', category: 'handdoeken', price_cents: 1995, stock: 30,
    description: 'Neemt veel water op, zodat je hond sneller droog is. 60 × 90 cm.' },
  { slug: 'droogjas-met-capuchon', name: 'Droogjas met capuchon', category: 'handdoeken', price_cents: 3495, stock: 12,
    description: 'Badjas van microvezel die je hond aantrekt na het wassen of een natte wandeling. Houdt je bank en auto droog.' },
  { slug: 'nagelknipper', name: 'Nagelknipper met stop', category: 'accessoires', price_cents: 995, stock: 35,
    description: 'Knipper met veiligheidsstop, zodat je niet te ver knipt.' },
  { slug: 'pootreiniger', name: 'Pootreiniger', category: 'accessoires', price_cents: 1695, stock: 22,
    description: 'Beker met zachte siliconen borstels. Water erin, poot erin, draaien: modder eruit, voordat hij binnen is.' },
];

const at = (daysAgo: number, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 12, 0, 0);
  return d.toISOString();
};

export function seedData() {
  const products: Product[] = P.map((p, i) => ({
    ...p,
    id: `demo-product-${i + 1}`,
    image_url: null,
    active: true,
    created_at: at(30 - i),
  }));
  const bySlug = (slug: string) => products.find((p) => p.slug === slug)!;

  const orders: Order[] = [];
  const order_items: OrderItem[] = [];
  const demoOrders = [
    { name: 'Sanne de Vries', email: 'sanne@example.com', street: 'Modderpad 12', postal_code: '3511 AB', city: 'Utrecht', country: 'NL',
      status: 'paid' as const, daysAgo: 0, lines: [['milde-hondenshampoo-250', 2], ['microvezel-badhanddoek', 1]] as const },
    { name: 'Jeroen Peeters', email: 'jeroen@example.com', street: 'Plasstraat 4', postal_code: '2000', city: 'Antwerpen', country: 'BE',
      status: 'shipped' as const, daysAgo: 3, lines: [['slickerborstel', 1], ['pootreiniger', 1]] as const },
    { name: 'Fatima el Amrani', email: 'fatima@example.com', street: 'Slootkant 88', postal_code: '1012 XY', city: 'Amsterdam', country: 'NL',
      status: 'open' as const, daysAgo: 1, lines: [['droogjas-met-capuchon', 1]] as const },
  ];

  demoOrders.forEach((o, i) => {
    const id = `00000000-0000-4000-8000-00000000000${i + 1}`;
    const lines = o.lines.map(([slug, quantity], j) => {
      const p = bySlug(slug);
      return { id: `${id}-${j}`, order_id: id, product_id: p.id, name: p.name, unit_price_cents: p.price_cents, quantity };
    });
    const subtotal = lines.reduce((s, l) => s + l.unit_price_cents * l.quantity, 0);
    const shipping = subtotal >= 5000 ? 0 : 495;
    order_items.push(...lines);
    orders.push({
      id, number: 1001 + i, status: o.status, name: o.name, email: o.email, street: o.street, postal_code: o.postal_code,
      city: o.city, country: o.country, phone: null, subtotal_cents: subtotal, shipping_cents: shipping, total_cents: subtotal + shipping,
      mollie_payment_id: null, stock_deducted: o.status !== 'open', stock_issue: false, created_at: at(o.daysAgo, 9 + i),
      paid_at: o.status === 'open' ? null : at(o.daysAgo, 9 + i), shipped_at: o.status === 'shipped' ? at(o.daysAgo - 1) : null,
    });
  });

  return { products, orders, order_items, nextOrderNumber: 1001 + demoOrders.length };
}
