import { Product, CouponCode } from './types';

export const GHL_PRODUCTS: Product[] = [
  {
    id: 'ghl-visor-cap',
    name: 'Ghl Visor Cap',
    price: 120000,
    category: 'Accessories',
    description: 'Off Thug official visor cap. Low profile shape, custom embroidered front logo, adjustable dual-color tactical clasp on the rear strap.',
    details: [
      '100% heavy cotton canvas shell',
      'Original GHL serif emblem front embroidery',
      'Unstructured 6-panel dome paneling',
      'Aged steel slide buckle adjustment',
      'Internal sweat-wicking custom band'
    ],
    sizes: ['OS'],
    images: ['visor-cap'],
    badge: 'NEW ARRIVAL',
    releaseDate: '2026-05-20',
    quotes: 'Crowned in silence. Crafted for daily combat.'
  },
  {
    id: 'ghl-silky-polo',
    name: 'GHL Vneck Polo',
    price: 91000,
    formerPrice: 100000,
    category: 'Polos',
    description: 'Luxurious silk-rayon blend V-neck polo in a pure all-white colorway. Features a relaxed high-fashion silhouette with a modern flat collar structure and premium drape.',
    details: [
      '55% Silk, 45% Rayon fine-gauge knit in pure white',
      'Minimalist ribbed V-neck collar silhouette',
      'Dropped shoulder seam for casual drape profile',
      'Side slit vents at straight bottom hem',
      'Silky cool-touch, heavyweight fluid movement'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['silky-shortsleeve'],
    badge: 'NEW ARRIVAL',
    releaseDate: '2026-05-25',
    quotes: 'Soft on the skin, heavy in the streets.'
  },
  {
    id: 'ghl-woven-polo',
    name: 'Ghl Woven Shortsleeve Polo',
    price: 480000,
    category: 'Polos',
    description: 'Heavyweight woven waffle-knit textured shortsleeve polo. Features tactical rib-neck styling and industrial branded custom snap flat-front buttons.',
    details: [
      '100% Compact combed cotton structured waffle',
      'Aged gunmetal branded snap button closure',
      'Ribbed sleeve cuffs with contrast dual tipping',
      'Preshrunk vintage garments dye washed',
      'Double-stitched seams for durability'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['woven-shortsleeve'],
    badge: 'NEW ARRIVAL',
    releaseDate: '2026-05-22'
  },
  {
    id: 'ghl-longsleeve-polo',
    name: 'Ghl Longsleeve Polo',
    price: 520000,
    category: 'Polos',
    description: 'Streetwear-contoured premium longsleeve knit polo. Interlock structural drape featuring high-rib elastic cuffs and a minimalist raw-carve placket.',
    details: [
      '85% Combed cotton, 15% Polyester interlock',
      'Invisible hidden-button aesthetic placket',
      'Reinforced rear shoulder taping for structure',
      '3-inch secure stretch-rib wrists',
      'Embroidered mini tonal signature on left cuff'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['longsleeve-polo'],
    badge: 'NEW ARRIVAL',
    releaseDate: '2026-05-18',
    quotes: 'Structured silhouette. Total freedom.'
  },
  {
    id: 'ghl-socks',
    name: 'Ghl Ribbed Slogan Socks',
    price: 120000,
    category: 'Accessories',
    description: 'Thick combed cotton ribbed crew socks featuring dual knit-in branding details: "GHL" on the cuff, and the official mantra "THUGGIN SINCE 19" on the sole.',
    details: [
      '80% Combed Cotton, 17% Polyester, 3% Elastane',
      'Double-padded plush underfoot looping for comfort',
      'Arch compression elastic support band',
      'Breathable instep panel knitting',
      'Classic high-calf height ribbed athletic look'
    ],
    sizes: ['OS'],
    images: ['ribbed-socks'],
    badge: 'NEW ARRIVAL',
    releaseDate: '2026-05-15',
    quotes: 'Thuggin Since 19.'
  },
  {
    id: 'ghl-stoned-denim-26',
    name: 'LONG JEAN 👖',
    price: 96000,
    formerPrice: 112000,
    category: 'Denim',
    description: 'Individually hand-distressed custom stonewash denim. Feature-heavy utility pocket panels, customized hardware studs, and stacked raw-hem draping for a straight bootcut stack.',
    details: [
      '14oz Japanese raw selvage cotton denim base',
      'Intricate potassium stonewash fade treatment',
      'Custom stamped metal rivets & buttons',
      'Signature offset triple cargo utility design',
      'Hand-frayed distressed knees and hem'
    ],
    sizes: ['30', '32', '34', '36'],
    images: ['stoned-denim'],
    badge: '1of1',
    releaseDate: '2026-05-28',
    quotes: 'Worth the wait... Go hard lux.'
  },
  {
    id: 'ghl-slides',
    name: 'Ghl High-Foam Slides',
    price: 400000,
    category: 'Footwear',
    description: 'Ergonomic light-foam comfort slide. Thick double-cushioned textured footbed with oversized debossed signature GHL branding block across upper band.',
    details: [
      'Flexible waterproof EVA injected foam',
      'Anatomical contouring for natural stance',
      'High-traction military tread pattern sole',
      'Debossed oversized serif block logo on strap',
      'Painless smooth inner lining to prevent rubbing'
    ],
    sizes: ['8', '9', '10', '11'],
    images: ['foam-slides'],
    badge: 'NEW ARRIVAL',
    releaseDate: '2026-05-10'
  },
  {
    id: 'ghl-analog-glasses',
    name: 'Ghl Analog Glasses',
    price: 120000,
    category: 'Eyewear',
    description: 'High-end rectangular street sunglasses. Tinted polycarbonate UV-protection lenses encased in polished acetate arms with embedded metal monogram.',
    details: [
      'Optical-grade hand-carved acetate frame',
      'Anti-glare UV400 protective dark tint lens',
      'Cast metal geometric GHL logo embedded in hinges',
      'Industrial reinforced dual-screw hardware',
      'Includes faux-leather brand protective sleeve'
    ],
    sizes: ['OS'],
    images: ['analog-glasses'],
    badge: 'NEW ARRIVAL',
    releaseDate: '2026-05-14',
    quotes: 'Look back at your shadows, find your vision.'
  },
  {
    id: 'ghl-athletics-19',
    name: 'GHL Braz Jersey',
    price: 47000,
    formerPrice: 59000,
    category: 'Tees',
    description: 'Heavyweight premium styled streetwear braz jersey with technical mesh paneling and signature typography puff details.',
    details: [
      'Polyester technical knit breathable jersey fabric',
      'Original GHL collegiate graphic detail print',
      'V-neck collar rib styling',
      'Reinforced athletic hem lines',
      'Contrast side tape accents'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: ['athletics-tee'],
    badge: 'NEW ARRIVAL',
    releaseDate: '2026-05-12',
    quotes: 'Athletes of the concrete court.'
  },
  {
    id: 'ghl-battlefield-tee',
    name: 'GHL 26 Jerseys',
    price: 71600,
    formerPrice: 80000,
    category: 'Tees',
    description: 'Tactical sand-dyed military combat tee with Tupacquote screenprint printed on upper back. Deep, premium raw stitch accent lines.',
    details: [
      '300GSM hyper-weight luxurious jersey fabric',
      'Front graphic features military tactical schematic coordinate',
      'Back features primary quote print: "Through every dark night, there\'s a bright day after"',
      'Distressed neckline and split sleeve-edge trims',
      'Slight long-line silhouette with dropped side seams'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['battlefield-tee'],
    badge: 'NEW ARRIVAL',
    releaseDate: '2026-05-24',
    quotes: 'Through every dark night, there\'s a bright day after.'
  },
  {
    id: 'ghl-crowned-chaos',
    name: 'GHL LS Tees',
    price: 96000,
    formerPrice: 110000,
    category: 'Tees',
    description: 'Striking contrast sleeve panel-blocked heavyweight knit longsleeve tee. Hand-printed "CROWNED BY CHAOS" stencil print detailing down sleeves.',
    details: [
      '100% Premium combed cotton jersey structure',
      'Oversized fit with extended block shoulder seam',
      'Heavy oil-based ink stencil typography prints on both arms',
      'Clean ribbed crewneck collar',
      'Double needle stitched cuffs and heavyweight side-slits'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['crowned-chaos-polo'],
    badge: 'NEW ARRIVAL',
    releaseDate: '2026-05-26',
    quotes: 'Chaos is the crown. Wear it proud.'
  },
  {
    id: 'ghl-snapback-original',
    name: 'Ghl Original Snapback',
    price: 120000,
    category: 'Accessories',
    description: 'High-profile traditional flat-brim snapback. Heavy textured wool-blend dome, 3D contrast font embroidery and classic plastic adjusters.',
    details: [
      '80% Wool, 20% Acrylic durable premium structure',
      'Raised 3D puff embroidery "GHL SINCE 19" on front',
      'Signature contrast bright neon under-brim lining',
      'Premium classic 7-hole snap closure',
      'Finished interior custom branding tape lines'
    ],
    sizes: ['OS'],
    images: ['snapback-hat'],
    releaseDate: '2026-05-02'
  },
  {
    id: 'ghl-soft-tee',
    name: 'Ghl Compact Soft Tee',
    price: 400000,
    category: 'Tees',
    description: 'Ultimate minimal daily essential. Features organic combed ultra-soft compact lightweight cotton with high stitch density and center-neck micro branding embroidery.',
    details: [
      '100% GOTS certified organic compact cotton',
      'Extremely soft luxury hand-feel surface finish',
      '1x1 micro ribbing neck with tiny high-gloss signature embroidery',
      'Internal back-neck comfort label cover',
      'Casual, everyday standard true-to-size length'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['soft-tee'],
    releaseDate: '2026-04-20'
  },
  {
    id: 'ghl-denim-archive',
    name: 'Ghl Denim Distressed',
    price: 600000,
    category: 'Denim',
    description: 'Archival five-pocket classic relaxed denim pant. Highlighted by intensive heavy wear-line stonewashing and hand-scraped faded detailing.',
    details: [
      '13.5oz Durable garment-dyed ring-spun denim',
      'Individually manual razor-scraped whiskering lines',
      'Tonal custom brand monogram embroidered patch',
      'Classic copper branded tack metal buttons',
      'Relaxed comfort thigh tapering down to puddle hem'
    ],
    sizes: ['30', '32', '34', '36'],
    images: ['archive-denim'],
    releaseDate: '2026-04-10',
    quotes: 'Locked in the Vault. Vintage GHL.'
  },
  {
    id: 'ghl-tee26-archive',
    name: 'Ghl Tee Pattern 26',
    price: 400000,
    category: 'Tees',
    description: 'Archival organic cotton graphics tee, featuring large high-definition distressed screenprint graphic block number 26 across the rear shoulders.',
    details: [
      '240GSM Medium weight breathable cotton jersey',
      'Distressed screen-printed "PATTERN 26" artwork on back',
      'Clean unbranded minimal front face design',
      'Garment pigment-dyed for a washed charcoal shade',
      'Double needle stitched flat hem trims'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['archive-tee26'],
    releaseDate: '2026-04-05'
  },
  {
    id: 'ghl-belt-archive',
    name: 'Ghl Tactical Webbing Belt',
    price: 120000,
    category: 'Accessories',
    description: 'High-tensile heavy canvas military style webbing belt. Features durable custom steel seatbelt-lock buckle style with matte black branding.',
    details: [
      'Military-spec thick nylon webbing canvas',
      'Matte black finished seatbelt release mechanism',
      'Laser-etched high contrast GHL logos on buckle front',
      'Metal-tipped tail end cap forbids fraying',
      'Fully adjustable 1.5-inch width, fits waist sizes up to 42'
    ],
    sizes: ['OS'],
    images: ['archive-belt'],
    releaseDate: '2026-03-15'
  },
  {
    id: 'ghl-stoned-pant-archive',
    name: 'Ghl Stoned Cargo Utility Pant',
    price: 620000,
    category: 'Denim',
    description: 'Archival heavyweight cotton cargo pants. Tailored with dual bellows zip-pockets, hand stonewash, and military-style adjustable ankle drawcords.',
    details: [
      '100% Cotton heavy drill duck canvas',
      'Stonewashed for individual shade variances',
      'Dual utility cargo pockets with custom snap covers',
      'Articulated panel knees for ergonomic walk comfort',
      'Ankle utility cords for tapered or puddle configurations'
    ],
    sizes: ['30', '32', '34', '36'],
    images: ['archive-stoned-pant'],
    releaseDate: '2026-03-10',
    quotes: 'Constructed to withstand any environment.'
  }
];

export const COUPON_CODES: CouponCode[] = [
  {
    code: 'THUG19',
    discountPercentage: 19,
    description: '19% OFF - The Official OFF THUG Launch discount'
  },
  {
    code: 'WORTHIT',
    discountPercentage: 10,
    description: '10% OFF - Worth The Wait loyal customer bonus'
  },
  {
    code: 'BATTLEFIELD',
    discountPercentage: 25,
    description: '25% OFF - Military Season Collection clearance'
  }
];
