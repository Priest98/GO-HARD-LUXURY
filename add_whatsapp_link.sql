-- =======================================================
-- ADD WHATSAPP_LINK COLUMN AND SEED GHL CAMO FC PRODUCT
-- =======================================================

-- 1. Add whatsapp_link column to products table if it doesn't already exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS whatsapp_link TEXT;

-- 2. Insert GHL CAMO FC product into the products table
INSERT INTO public.products (
  id, 
  name, 
  price, 
  category, 
  description, 
  details, 
  sizes, 
  images, 
  sold_out, 
  badge, 
  quotes, 
  release_date, 
  former_price, 
  whatsapp_link
)
VALUES (
  'ghl-camo-fc',
  'GHL CAMO FC',
  35000,
  'Accessories',
  'Premium high-profile structured woodland camouflage cap. Custom embroidered front logo design, unstructured 6-panel dome paneling, and adjustable tactical clasp.',
  ARRAY[
    'Premium heavy camouflage cotton shell', 
    'Original GHL front logo embroidery', 
    'Structured 6-panel dome paneling', 
    'Adjustable rear slide buckle or snap strap', 
    'Internal sweat-wicking custom band'
  ],
  ARRAY['OS'],
  ARRAY['/image/cap/IMG_8429.JPG.jpeg'],
  false,
  'NEW ARRIVAL',
  'Crowned in silence. Built to carry the weight.',
  '2026-06-12',
  45000,
  'https://wa.me/p/25719671704311754/2349038499673'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  former_price = EXCLUDED.former_price,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  details = EXCLUDED.details,
  sizes = EXCLUDED.sizes,
  images = EXCLUDED.images,
  badge = EXCLUDED.badge,
  quotes = EXCLUDED.quotes,
  release_date = EXCLUDED.release_date,
  whatsapp_link = EXCLUDED.whatsapp_link;

-- 3. Insert GHL HOODIE product into the products table
INSERT INTO public.products (
  id, 
  name, 
  price, 
  category, 
  description, 
  details, 
  sizes, 
  images, 
  sold_out, 
  badge, 
  quotes, 
  release_date, 
  former_price, 
  whatsapp_link
)
VALUES (
  'ghl-hoodie-members',
  'GHL HOODIE',
  99000,
  'Tracksuits',
  'Premium heavy-knit members-only hoodie. Features signature double-lined structured hood, front kangaroo pocket, custom GHL engraved metal hardware, and relaxed high-fashion streetwear silhouette.',
  ARRAY[
    '85% Combed organic cotton, 15% Polyester fleece base', 
    'Double-lined structured hood for premium drape', 
    'Front utility kangaroo pocket detailing', 
    'Ribbed cuffs and waistband styling', 
    'Tonal embroidered branding detail on chest'
  ],
  ARRAY['S', 'M', 'L', 'XL'],
  ARRAY['/image/sweatshirt/IMG_0106.JPG.jpeg'],
  false,
  'NEW ARRIVAL',
  '4TOP MEMBERS ONLY✨',
  '2026-06-12',
  116000,
  'https://wa.me/p/26738126365823997/2349038499673'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  former_price = EXCLUDED.former_price,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  details = EXCLUDED.details,
  sizes = EXCLUDED.sizes,
  images = EXCLUDED.images,
  badge = EXCLUDED.badge,
  quotes = EXCLUDED.quotes,
  release_date = EXCLUDED.release_date,
  whatsapp_link = EXCLUDED.whatsapp_link;

-- 4. Update UP&DOWN product's price and whatsapp_link in products table
UPDATE public.products 
SET 
  price = 160600,
  whatsapp_link = 'https://wa.me/p/26511439021850765/2349038499673'
WHERE id = 'ghl-woven-polo';
