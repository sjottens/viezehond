-- Optioneel: voorbeeldproducten om mee te testen. Gelijk aan de lokale demo (lib/store/seed.ts).
insert into products (slug, name, description, price_cents, stock, category) values
('metalen-kam-fijn-grof', 'Metalen kam fijn/grof', 'Stevige kam met twee tandafstanden. De grove kant voor het ontwarren, de fijne kant voor het afwerken.', 1295, 40, 'kammen'),
('slickerborstel', 'Slickerborstel', 'Verwijdert losse ondervacht en kleine klitten. Geschikt voor middellange en lange vachten.', 1750, 25, 'kammen'),
('ontklitkam', 'Ontklitkam', 'Met afgeronde messen die klitten doorsnijden zonder aan de huid te trekken.', 1495, 3, 'kammen'),
('borstelhandschoen', 'Borstelhandschoen', 'Rubberen noppen die losse haren en opgedroogde modder meenemen. Voelt voor je hond als een aai.', 995, 50, 'kammen'),
('milde-hondenshampoo-250', 'Milde hondenshampoo 250 ml', 'Parfumvrije shampoo met een neutrale pH, ook voor gevoelige huid.', 1195, 60, 'shampoo'),
('anti-klit-conditioner-250', 'Anti-klit conditioner 250 ml', 'Maakt de vacht soepel en makkelijker te kammen na het wassen.', 1295, 45, 'shampoo'),
('droogshampoo-spray', 'Droogshampoo spray 200 ml', 'Voor tussendoor: opsprayen, inmasseren en uitborstelen. Zonder water.', 1095, 0, 'shampoo'),
('microvezel-badhanddoek', 'Microvezel badhanddoek', 'Neemt veel water op, zodat je hond sneller droog is. 60 × 90 cm.', 1995, 30, 'handdoeken'),
('droogjas-met-capuchon', 'Droogjas met capuchon', 'Badjas van microvezel die je hond aantrekt na het wassen of een natte wandeling. Houdt je bank en auto droog.', 3495, 12, 'handdoeken'),
('nagelknipper', 'Nagelknipper met stop', 'Knipper met veiligheidsstop, zodat je niet te ver knipt.', 995, 35, 'accessoires'),
('pootreiniger', 'Pootreiniger', 'Beker met zachte siliconen borstels. Water erin, poot erin, draaien: modder eruit, voordat hij binnen is.', 1695, 22, 'accessoires')
on conflict (slug) do nothing;
