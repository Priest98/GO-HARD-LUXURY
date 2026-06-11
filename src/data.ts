import { Product, CouponCode } from './types';

export const GHL_PRODUCTS: Product[] = [
  {
    id: 'ghl-visor-cap',
    name: 'Hat',
    price: 46000,
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
    images: ['/image/cap/ghl_cap_visor.jpeg'],
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
    images: ['/image/polo/IMG_0475.JPG.jpeg'],
    badge: 'NEW ARRIVAL',
    releaseDate: '2026-05-25',
    quotes: 'Soft on the skin, heavy in the streets.'
  },
  {
    id: 'ghl-woven-polo',
    name: 'UP&DOWN',
    price: 160000,
    formerPrice: 180000,
    category: 'Tracksuits',
    description: 'Premium technical streetwear tracksuit set featuring matching zip-up jacket and relaxed utility track pants. Finished with signature GHL metal custom hardware and dynamic piping details.',
    details: [
      'Heavyweight double-knit performance interlock fabric',
      'Matching full-zip jacket and relaxed utility track pants',
      'Custom GHL engraved metal zip-pullers & hardware',
      'Contrasting side piping lines and ribbed elastic hems',
      'Secure zip-pockets for modern utility'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['/image/sweatshirt/IMG_9949.JPG.jpeg'],
    badge: 'NEW ARRIVAL',
    releaseDate: '2026-05-22'
  },
  {
    id: 'ghl-longsleeve-polo',
    name: 'GHL LS Tees',
    price: 96000,
    formerPrice: 110000,
    category: 'Tees',
    description: 'Streetwear-contoured premium longsleeve knit tee. Interlock structural drape featuring high-rib elastic cuffs and a minimalist raw-cut hem.',
    details: [
      '85% Combed cotton, 15% Polyester interlock',
      'Ribbed crewneck collar styling',
      'Reinforced rear shoulder taping for structure',
      '3-inch secure stretch-rib wrists',
      'Embroidered mini tonal signature on left cuff'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['/image/Tees/ghl_tee_long.jpeg'],
    badge: 'NEW ARRIVAL',
    releaseDate: '2026-05-18',
    quotes: 'Structured silhouette. Total freedom.'
  },
  {
    id: 'ghl-stoned-denim-26',
    name: 'LONG JEAN',
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
    images: ['/image/denim/ghl_denim_stoned.jpeg'],
    badge: '1of1',
    releaseDate: '2026-05-28',
    quotes: 'Worth the wait... Go hard lux.'
  },
  {
    id: 'ghl-slides',
    name: 'Slippers',
    price: 81000,
    formerPrice: 96000,
    category: 'Footwear',
    description: 'Ergonomic light-foam comfort slippers. Thick double-cushioned textured footbed with oversized debossed signature GHL branding block across upper band.',
    details: [
      'Flexible waterproof EVA injected foam',
      'Anatomical contouring for natural stance',
      'High-traction military tread pattern sole',
      'Debossed oversized serif block logo on strap',
      'Painless smooth inner lining to prevent rubbing'
    ],
    sizes: ['8', '9', '10', '11'],
    images: ['/image/slides/IMG_9834.JPG.jpeg'],
    badge: 'NEW ARRIVAL',
    releaseDate: '2026-05-10'
  },
  {
    id: 'ghl-analog-glasses',
    name: 'GHL HAT TME BLACK',
    price: 46000,
    formerPrice: 58000,
    category: 'Accessories',
    description: 'Premium high-profile structured snapback cap. Crafted with premium wool-blend fabrication, detailed front branding embroidery, and traditional adjustable snapback closure.',
    details: [
      'Premium wool-blend structured crown paneling',
      'Detailed front signature embroidery design',
      'Flat brim silhouette with contrast green under-brim',
      'Classic adjustable 7-hole snap closure',
      'Finished interior custom logo branding tape'
    ],
    sizes: ['OS'],
    images: ['/image/cap/IMG_0491.JPG.jpeg'],
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
    images: ['/image/Tees/IMG_8427.JPG.jpeg'],
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
    images: ['/image/Tees/IMG_9422.JPG.jpeg'],
    badge: 'NEW ARRIVAL',
    releaseDate: '2026-05-24',
    quotes: 'Through every dark night, there\'s a bright day after.'
  },
  {
    id: 'ghl-crowned-chaos',
    name: 'GHL LS Tees',
    price: 96000,
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
    images: ['/image/Tees/ghl_tee_chaos.jpeg'],
    badge: 'NEW ARRIVAL',
    releaseDate: '2026-05-26',
    quotes: 'Chaos is the crown. Wear it proud.'
  },
  {
    id: 'ghl-snapback-original',
    name: 'GHL LEO HAT',
    price: 59000,
    formerPrice: 70000,
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
    images: ['/image/cap/ghl_cap_snapback.jpeg'],
    releaseDate: '2026-05-02'
  },
  {
    id: 'ghl-soft-tee',
    name: 'GHL COLOR TEES',
    price: 81000,
    formerPrice: 90000,
    category: 'Tees',
    description: 'Premium garment-dyed organic combed cotton tee, available in a variety of curated street hues. Features high stitch density and center-neck micro branding embroidery.',
    details: [
      '100% GOTS certified organic compact cotton',
      'Garment-dyed for individually unique vintage color hues',
      '1x1 micro ribbing neck with tiny high-gloss signature embroidery',
      'Internal back-neck comfort label cover',
      'Casual, everyday standard true-to-size length'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['/image/Tees/IMG_0932.JPG.jpeg'],
    releaseDate: '2026-04-20'
  },
  {
    id: 'ghl-denim-archive',
    name: 'GO HARD LUX LONG JEAN',
    price: 50000,
    formerPrice: 60000,
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
    images: ['/image/denim/ghl_denim_archive.jpeg'],
    releaseDate: '2026-04-10',
    quotes: 'Locked in the Vault. Vintage GHL.'
  },
  {
    id: 'ghl-tee26-archive',
    name: 'GHL 26 Jerseys',
    price: 71600,
    formerPrice: 80000,
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
    images: ['/image/Tees/IMG_9423.JPG.jpeg'],
    releaseDate: '2026-04-05'
  },

  {
    id: 'ghl-stoned-pant-archive',
    name: 'GHL logo shorts',
    price: 60000,
    formerPrice: 70000,
    category: 'Denim',
    description: 'Premium athletic shorts featuring contrast side panel piping, comfortable elastic waistband with drawcords, and custom GHL logo embroidery on the left hem.',
    details: [
      'Premium breathable athletic performance fabric',
      'Contrast side panel block and piping details',
      'Comfortable elastic waistband with adjustable tactical drawcords',
      'Signature GHL embroidered logo on the left leg',
      'Dual secure side slip pockets for daily essentials'
    ],
    sizes: ['30', '32', '34', '36'],
    images: ['/image/denim/ghl_denim_pant.png'],
    releaseDate: '2026-03-10',
    quotes: 'Styled for comfort. Designed for the streets.'
  },
  {
    id: 'ghl-cap-0490',
    name: 'GHL TME HAT',
    price: 46000,
    formerPrice: 58000,
    category: 'Accessories',
    description: 'Premium high-profile structured trucker cap. Front GHL embroidery with contrast mesh backing.',
    details: [
      'Structured 5-panel trucker profile',
      'High-density signature front embroidery',
      'Breathable technical mesh back panels',
      'Adjustable snapback closure',
      'Sweat-wicking interior headband'
    ],
    sizes: ['OS'],
    images: ['/image/cap/IMG_0490.JPG.jpeg'],
    releaseDate: '2026-06-01',
    quotes: 'Breathe easy. Stand heavy.'
  },
  {
    id: 'ghl-cap-0492',
    name: 'GHL HAT 0492',
    price: 60000,
    formerPrice: 75000,
    category: 'Accessories',
    description: 'Archival snapback cap with vintage embroidery details.',
    details: [
      'Premium washed cotton canvas crown',
      'Distressed detail edge lines',
      'Classic 6-panel unstructured fit',
      'Embroidered ventilation eyelets',
      'Adjustable brass clasp rear strap'
    ],
    sizes: ['OS'],
    images: ['/image/cap/IMG_0492.JPG.jpeg'],
    releaseDate: '2026-05-30',
    quotes: 'Archived from the streets.'
  },
  {
    id: 'ghl-denim-1897',
    name: 'long jean side design',
    price: 96000,
    formerPrice: 112000,
    category: 'Denim',
    description: 'Heavyweight custom fit raw denim shorts. Finished with signature pocket detailing.',
    details: [
      '14oz Japanese raw denim fabric',
      'Relaxed, loose-fit streetwear profile',
      'Custom engraved hardware studs and rivets',
      'Frayed raw-edge hem styling',
      'Signature contrast triple stitching'
    ],
    sizes: ['30', '32', '34', '36'],
    images: ['/image/denim/IMG_1897.JPG.jpeg'],
    releaseDate: '2026-06-03',
    quotes: 'Unfinished edges. Untamed mindset.'
  },
  {
    id: 'ghl-denim-9513',
    name: 'CARGO JEAN',
    price: 96000,
    category: 'Denim',
    description: 'Tactical multi-pocket cargo jeans. Heavy canvas reinforcement and adjustable cuffs.',
    details: [
      'Heavy duty 13.5oz pre-washed denim',
      'Dual tactical utility cargo side pockets',
      'Reinforced knee panel inserts',
      'Adjustable toggle drawcords at cuffs',
      'Custom leather rear branding patch'
    ],
    sizes: ['30', '32', '34', '36'],
    images: ['/image/denim/IMG_9513.JPG.jpeg'],
    releaseDate: '2026-06-04',
    quotes: 'Built to carry the weight.'
  },
  {
    id: 'ghl-sweatshirt-0102',
    name: 'GHL LS TEES black',
    price: 96000,
    formerPrice: 110000,
    category: 'Tees',
    description: 'Premium heavyweight long sleeve tee in dark black. Finished with custom signature branding.',
    details: [
      'Premium heavyweight cotton interlock fabric',
      'Comfortable crewneck design',
      'Clean ribbed cuffs',
      'Signature GHL logo branding',
      'Relaxed modern streetwear fit'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['/image/sweatshirt/IMG_0102.JPG.jpeg'],
    releaseDate: '2026-06-05',
    quotes: 'Heavy knit. Pure focus.'
  },
  {
    id: 'ghl-sweatshirt-0103',
    name: 'GHL LS TEES white',
    price: 96000,
    formerPrice: 110000,
    category: 'Tees',
    description: 'Premium heavyweight long sleeve tee in clean white. Finished with custom signature branding.',
    details: [
      'Premium heavyweight cotton interlock fabric',
      'Comfortable crewneck design',
      'Clean ribbed cuffs',
      'Signature GHL logo branding',
      'Relaxed modern streetwear fit'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['/image/sweatshirt/IMG_0103.JPG.jpeg'],
    releaseDate: '2026-06-06',
    quotes: 'Shielded from the cold.'
  },
  {
    id: 'ghl-tee-0933',
    name: 'GHL logo tees',
    price: 70000,
    formerPrice: 95000,
    category: 'Tees',
    description: 'Vintage washed cotton graphic tee featuring signature collection schematic front print.',
    details: [
      '280GSM Combed cotton jersey base',
      'Garment pigment-dyed for washed grey look',
      'High-definition distressed graphic front print',
      'Thick ribbed collar banding',
      'Relaxed boxy oversized streetwear drape'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['/image/Tees/IMG_0933.JPG.jpeg'],
    releaseDate: '2026-06-07',
    quotes: 'Schematic designs of streetwear.'
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
