import React from 'react';

const PRODUCT_IMAGES: Record<string, string> = {
  'ghl-visor-cap': '/image/cap/ghl_cap_visor.jpeg',
  'ghl-snapback-original': '/image/cap/ghl_cap_snapback.jpeg',
  'ghl-silky-polo': '/image/polo/IMG_0475.JPG.jpeg',
  'ghl-woven-polo': '/image/sweatshirt/IMG_9949.JPG.jpeg',
  'ghl-longsleeve-polo': '/image/Tees/ghl_tee_long.jpeg',
  'ghl-crowned-chaos': '/image/Tees/ghl_tee_chaos.jpeg',
  'ghl-stoned-denim-26': '/image/denim/ghl_denim_stoned.jpeg',
  'ghl-denim-archive': '/image/denim/ghl_denim_archive.jpeg',
  'ghl-stoned-pant-archive': '/image/denim/ghl_denim_pant.png',
  'ghl-slides': '/image/slides/IMG_9834.JPG.jpeg',
  'ghl-athletics-19': '/image/Tees/IMG_8427.JPG.jpeg',
  'ghl-battlefield-tee': '/image/Tees/IMG_9422.JPG.jpeg',
  'ghl-soft-tee': '/image/Tees/IMG_0932.JPG.jpeg',
  'ghl-tee26-archive': '/image/Tees/IMG_9423.JPG.jpeg',
  'ghl-analog-glasses': '/image/cap/IMG_0491.JPG.jpeg',
  'ghl-socks': '/image/socks/ghl_ribbed_socks.png',
};

interface VisualizerProps {
  productId: string;
  className?: string;
  isDetailView?: boolean;
  productImageUrl?: string; // added to support custom uploaded images
}

export const ProductVisualizer: React.FC<VisualizerProps> = ({
  productId,
  className = '',
  isDetailView = false,
  productImageUrl
}) => {
  // Use productImageUrl if it is a valid path or remote URL, otherwise fall back to PRODUCT_IMAGES
  const isValidUrl = productImageUrl && (productImageUrl.startsWith('http') || productImageUrl.startsWith('/') || productImageUrl.startsWith('data:'));
  const imageSrc = isValidUrl ? productImageUrl : PRODUCT_IMAGES[productId];
  const hasImage = !!imageSrc;

  // Common design grid background for tactical brand theme
  const renderGrid = () => (
    <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id={`grid-${productId}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" h="100%" fill={`url(#grid-${productId})`} />
      {/* Blueprint technical markers */}
      <circle cx="20" cy="20" r="1.5" fill="currentColor" />
      <circle cx="95%" cy="20" r="1.5" fill="currentColor" />
      <circle cx="20" cy="95%" r="1.5" fill="currentColor" />
      <circle cx="95%" cy="95%" r="1.5" fill="currentColor" />
      <path d="M 10,20 L 30,20 M 20,10 L 20,30" stroke="currentColor" strokeWidth="0.75" />
      <path d="M 90%,20 L 100%,20 M 95%,10 L 95%,30" stroke="currentColor" strokeWidth="0.75" />
    </svg>
  );

  const getVectorContent = () => {
    switch (productId) {
      case 'ghl-visor-cap':
        return (
          <g transform="translate(10, 10) scale(0.9)">
            {/* Crown of Cap */}
            <path d="M 60,110 C 60,65 100,50 140,50 C 180,50 220,65 220,110 Z" fill="#1C1C1E" stroke="#8E8E93" strokeWidth="2.5" />
            {/* Back strap hint */}
            <path d="M 220,105 C 220,108 228,107 230,100" fill="none" stroke="#D9FE00" strokeWidth="3" />
            {/* Visor / Brim */}
            <path d="M 50,110 C 35,115 15,130 18,140 C 35,142 80,135 105,123 Z" fill="#111" stroke="#8E8E93" strokeWidth="2" />
            <path d="M 50,110 C 90,115 150,115 220,110" fill="none" stroke="#444" strokeWidth="2" strokeDasharray="3,3" />
            {/* Embroidered OFT Front Logo */}
            <text x="110" y="92" fill="#D9FE00" fontFamily="var(--font-display)" fontSize="18" fontWeight="bold" letterSpacing="1">GHL</text>
            <text x="115" y="103" fill="#8E8E93" fontFamily="var(--font-mono)" fontSize="7" letterSpacing="0.5">EST. 19</text>
            {/* Stitching details */}
            <path d="M 140,50 C 140,80 140,110 140,110" fill="none" stroke="#2E2E33" strokeWidth="1.5" strokeDasharray="4,4" />
            <path d="M 60,110 Q 140,85 220,110" fill="none" stroke="#2E2E33" strokeWidth="1.5" strokeDasharray="4,4" />
          </g>
        );

      case 'ghl-silky-polo':
        return (
          <g transform="translate(10, 10) scale(0.9)">
            {/* Main Tee/Polo Shape in White */}
            <path d="M 70,80 L 100,60 L 130,70 L 140,75 L 150,75 L 160,70 L 190,60 L 220,80 L 205,115 L 185,110 L 185,210 L 105,210 L 105,110 L 85,115 Z" fill="#FFFFFF" stroke="#8E8E93" strokeWidth="2.5" />
            {/* Sleeves stitch panel */}
            <path d="M 100,60 L 105,110" fill="none" stroke="#D1D1D6" strokeWidth="1" strokeDasharray="3,3" />
            <path d="M 190,60 L 185,110" fill="none" stroke="#D1D1D6" strokeWidth="1" strokeDasharray="3,3" />
            {/* V-neck dark opening */}
            <path d="M 132,70 L 145,95 L 158,70 Z" fill="#1A1A1E" />
            {/* V-neck collar ribs */}
            <path d="M 130,70 L 145,97" stroke="#AEAEB2" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 160,70 L 145,97" stroke="#AEAEB2" strokeWidth="2.5" strokeLinecap="round" />
            {/* Minimal left chest GHL monogram */}
            <text x="112" y="115" fill="#1A1A1E" fontFamily="var(--font-luxury)" fontSize="7" fontWeight="black" letterSpacing="0.2">GHL</text>
            {/* Soft creases/folds on white fabric */}
            <path d="M 115,140 Q 145,146 175,135" fill="none" stroke="#E5E5EA" strokeWidth="2" />
            <path d="M 110,180 Q 135,176 180,185" fill="none" stroke="#E5E5EA" strokeWidth="1.5" />
          </g>
        );

      case 'ghl-woven-polo':
        return (
          <g transform="translate(10, 10) scale(0.9)">
            {/* TRACK JACKET (TOP) */}
            {/* Jacket Body */}
            <path d="M 80,75 L 105,58 L 125,66 L 140,66 L 160,58 L 185,75 L 175,100 L 160,96 L 160,140 L 105,140 L 105,96 L 90,100 Z" fill="#1C1C1E" stroke="#8E8E93" strokeWidth="2" />
            {/* Jacket Sleeves */}
            <path d="M 90,100 L 70,135 L 82,140 L 105,108" fill="#1C1C1E" stroke="#8E8E93" strokeWidth="2" />
            <path d="M 175,100 L 195,135 L 183,140 L 160,108" fill="#1C1C1E" stroke="#8E8E93" strokeWidth="2" />
            {/* Contrast neon sleeve stripes */}
            <path d="M 83,82 L 75,125" stroke="#D9FE00" strokeWidth="1.5" />
            <path d="M 182,82 L 190,125" stroke="#D9FE00" strokeWidth="1.5" />
            {/* Center Zip */}
            <line x1="132" y1="66" x2="132" y2="140" stroke="#8E8E93" strokeWidth="1.5" />
            <rect x="130" y="75" width="4" height="8" rx="1" fill="#D9FE00" />
            {/* Jacket collar detail */}
            <path d="M 125,66 Q 132,74 140,66" fill="none" stroke="#8E8E93" strokeWidth="2" />

            {/* TRACK PANTS (BOTTOM) */}
            {/* Pants legs */}
            <path d="M 110,148 L 110,215 L 128,215 L 132,170 L 137,170 L 141,215 L 159,215 L 159,148 Z" fill="#1C1C1E" stroke="#8E8E93" strokeWidth="2" />
            {/* Waistband */}
            <rect x="110" y="145" width="49" height="6" rx="1" fill="#2C2C2E" stroke="#8E8E93" strokeWidth="1" />
            {/* Drawstrings */}
            <line x1="132" y1="151" x2="130" y2="163" stroke="#D9FE00" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="137" y1="151" x2="139" y2="163" stroke="#D9FE00" strokeWidth="1.5" strokeLinecap="round" />
            {/* Contrast neon side stripes on pants */}
            <line x1="113" y1="151" x2="113" y2="213" stroke="#D9FE00" strokeWidth="1.5" />
            <line x1="156" y1="151" x2="156" y2="213" stroke="#D9FE00" strokeWidth="1.5" />
          </g>
        );

      case 'ghl-longsleeve-polo':
        return (
          <g transform="translate(10, 10) scale(0.9)">
            {/* T-shirt main body */}
            <path d="M 70,80 L 100,60 L 130,70 L 150,75 L 160,70 L 190,60 L 220,80 L 205,100 L 185,95 L 185,210 L 105,210 L 105,95 L 85,100 Z" fill="#1C1C1E" stroke="#8E8E93" strokeWidth="2.5" />
            {/* Long sleeves details extending past typical short sleeves */}
            {/* Left sleeve long */}
            <path d="M 85,100 L 50,180 L 65,185 L 105,110" fill="#1C1C1E" stroke="#8E8E93" strokeWidth="2.5" />
            {/* Right sleeve long */}
            <path d="M 205,100 L 240,180 L 225,185 L 185,110" fill="#1C1C1E" stroke="#8E8E93" strokeWidth="2.5" />
            {/* Yellow wrist ribbed cuffs */}
            <rect x="49" y="177" width="16" height="8" transform="rotate(-7, 57, 181)" fill="#D9FE00" stroke="#8E8E93" strokeWidth="1" />
            <rect x="224" y="177" width="16" height="8" transform="rotate(7, 232, 181)" fill="#D9FE00" stroke="#8E8E93" strokeWidth="1" />
            {/* Clean collar line */}
            <path d="M 130,70 L 145,85 L 160,70" fill="none" stroke="#D9FE00" strokeWidth="2" />
            {/* Logo highlight sleeve side */}
            <circle cx="57" cy="165" r="2" fill="#D9FE00" />
          </g>
        );

      case 'ghl-socks':
        return (
          <g transform="translate(30, 10) scale(0.9)">
            {/* Left Sock */}
            <g transform="translate(0,0)">
              {/* Backing foot shape */}
              <path d="M 60,40 L 90,40 L 90,130 C 90,140 100,148 120,155 L 115,175 C 90,175 70,165 65,150 L 60,130 Z" fill="#1A1A1E" stroke="#8E8E93" strokeWidth="2.5" />
              {/* Top ribbing cuff */}
              <rect x="60" y="40" width="30" height="12" fill="#D9FE00" stroke="#222" strokeWidth="1" />
              <line x1="66" y1="40" x2="66" y2="52" stroke="#222" strokeWidth="0.75" />
              <line x1="72" y1="40" x2="72" y2="52" stroke="#222" strokeWidth="0.75" />
              <line x1="78" y1="40" x2="78" y2="52" stroke="#222" strokeWidth="0.75" />
              <line x1="84" y1="40" x2="84" y2="52" stroke="#222" strokeWidth="0.75" />
              {/* Knit-in OFT logo on ribbing side */}
              <text x="63" y="78" fill="#F8F8FA" fontFamily="var(--font-mono)" fontSize="10" fontWeight="bold">GHL</text>
              <text x="63" y="90" fill="#D9FE00" fontFamily="var(--font-mono)" fontSize="8">#19</text>
              {/* Foot grip stripes */}
              <line x1="85" y1="160" x2="105" y2="167" stroke="#D9FE00" strokeWidth="3" opacity="0.6" />
            </g>
            {/* Right Sock rotated behind */}
            <g transform="translate(60, 10) rotate(15, 75, 107)">
              <path d="M 60,40 L 90,40 L 90,130 C 90,140 100,148 120,155 L 115,175 C 90,175 70,165 65,150 L 60,130 Z" fill="#151518" stroke="#555" strokeWidth="2" />
              <rect x="60" y="40" width="30" height="12" fill="#2E2E33" stroke="#111" strokeWidth="1" />
              <text x="63" y="78" fill="#8E8E93" fontFamily="var(--font-mono)" fontSize="10" fontWeight="bold">GHL</text>
            </g>
          </g>
        );

      case 'ghl-stoned-denim-26':
        return (
          <g transform="translate(10, 10) scale(0.9)">
            {/* Waistband */}
            <path d="M 85,50 L 195,50 L 195,65 L 85,65 Z" fill="#1C1C1E" stroke="#8E8E93" strokeWidth="2.5" />
            {/* Belt loops */}
            <rect x="100" y="48" width="6" height="18" fill="#D9FE00" />
            <rect x="140" y="48" width="6" height="18" fill="#555" />
            <rect x="174" y="48" width="6" height="18" fill="#D9FE00" />
            {/* Main legs pants */}
            <path d="M 85,65 L 135,110 L 130,220 L 90,225 L 80,110 Z" fill="#2D3035" stroke="#8E8E93" strokeWidth="2.5" />
            <path d="M 195,65 L 145,110 L 150,220 L 190,225 L 200,110 Z" fill="#2D3035" stroke="#8E8E93" strokeWidth="2.5" />
            {/* Yellow stitch accent lines */}
            <path d="M 85,65 C 105,75 140,75 140,110" fill="none" stroke="#D9FE00" strokeWidth="1" strokeDasharray="3,3" />
            <path d="M 195,65 C 175,75 140,75 140,110" fill="none" stroke="#D9FE00" strokeWidth="1" strokeDasharray="3,3" />
            {/* Distressed scraping knee circles */}
            <ellipse cx="108" cy="140" rx="10" ry="4" stroke="#D9FE00" strokeWidth="1" strokeDasharray="2,2" fill="none" />
            <ellipse cx="170" cy="145" rx="8" ry="3" stroke="#D9FE00" strokeWidth="1" strokeDasharray="2,2" fill="none" />
            <line x1="100" y1="140" x2="116" y2="140" stroke="#F8F8FA" strokeWidth="1.5" />
            <line x1="164" y1="146" x2="176" y2="144" stroke="#F8F8FA" strokeWidth="1.5" />
            {/* Extra side utility pocket */}
            <path d="M 183,120 L 198,123 L 195,150 L 180,147 Z" fill="#1C1C1E" stroke="#D9FE00" strokeWidth="1.5" />
            <text x="183" y="138" fill="#D9FE00" fontFamily="var(--font-mono)" fontSize="6">26</text>
            {/* Distressed ankle fraying */}
            <path d="M 90,225 Q 95,221 100,226 T 110,224 M 150,220 Q 160,223 170,220" fill="none" stroke="#8E8E93" strokeWidth="1.5" />
          </g>
        );

      case 'ghl-slides':
        return (
          <g transform="translate(10, 10) scale(0.9)">
            {/* Thick cushion sole */}
            <path d="M 60,150 C 60,130 90,120 140,120 C 190,120 220,130 220,150 C 220,165 200,175 140,175 C 80,175 60,165 60,150 Z" fill="#1c1c1e" stroke="#8E8E93" strokeWidth="2.5" />
            {/* Yellow accent inner padding boundary */}
            <path d="M 68,148 C 68,135 95,126 140,126 C 185,126 211,135 211,148 C 211,158 190,167 140,167 C 90,167 68,158 68,148 Z" fill="none" stroke="#D9FE00" strokeWidth="1" strokeDasharray="3,3" />
            {/* Slide Strap upper band */}
            <path d="M 95,130 C 105,100 150,90 185,115 C 195,125 190,148 180,152 C 165,145 120,145 95,130 Z" fill="#101012" stroke="#8E8E93" strokeWidth="2" />
            {/* Embossed OFT on strap */}
            <text x="115" y="132" fill="#D9FE00" fontFamily="var(--font-display)" fontSize="18" fontWeight="bold" letterSpacing="1" transform="rotate(-5, 130, 125)">GHL</text>
            {/* Sole grip ridges */}
            <line x1="120" y1="171" x2="135" y2="171" stroke="#2C2C30" strokeWidth="2.5" />
            <line x1="145" y1="172" x2="160" y2="172" stroke="#2C2C30" strokeWidth="2.5" />
          </g>
        );

      case 'ghl-analog-glasses':
        return (
          <g transform="translate(10, 10) scale(0.9)">
            {/* Structured high panel flat brim Snapback cap in charcoal grey */}
            <path d="M 60,110 C 60,50 100,45 140,45 C 180,45 220,50 220,110 Z" fill="#2C2C2E" stroke="#8E8E93" strokeWidth="2.5" />
            {/* Flat brim standing out straight */}
            <path d="M 50,110 L 15,110 C 13,124 45,123 60,118" fill="#1A1A1C" stroke="#8E8E93" strokeWidth="2" />
            {/* Front embroidery styling */}
            <text x="108" y="85" fill="#D9FE00" fontFamily="var(--font-luxury)" fontSize="14" fontWeight="black">GHL</text>
            <text x="102" y="96" fill="#8E8E93" fontFamily="var(--font-mono)" fontSize="5.5" letterSpacing="0.5">OFFICIAL CAP</text>
            {/* Top crown button */}
            <ellipse cx="140" cy="45" rx="5" ry="2.5" fill="#D9FE00" stroke="#111" />
            {/* Inner neon brim glow indicator */}
            <path d="M 15,110 C 35,113 50,111 60,114" fill="none" stroke="#D9FE00" strokeWidth="1.5" />
          </g>
        );

      case 'ghl-athletics-19':
        return (
          <g transform="translate(10, 10) scale(0.9)">
            {/* T-Shirt Boxy Heavy Silhouette */}
            <path d="M 60,70 L 100,50 L 130,60 L 152,60 L 182,50 L 222,70 L 198,118 L 178,112 L 178,225 L 104,225 L 104,112 L 84,118 Z" fill="#18181A" stroke="#8E8E93" strokeWidth="2.5" />
            {/* Neck Ribband lines */}
            <path d="M 130,60 C 130,73 152,73 152,60" fill="none" stroke="#D9FE00" strokeWidth="2.5" />
            {/* High density puff lettering "ATHLETICS 19" on mid chest */}
            <path d="M 96,95 Q 141,83 186,95" fill="none" stroke="#222" strokeWidth="18" strokeLinecap="round" />
            <path d="M 97,95 Q 141,83 185,95" fill="none" stroke="#D9FE00" strokeWidth="14" strokeLinecap="round" />
            <text x="100" y="99" fill="#111" fontFamily="var(--font-display)" fontSize="10" fontWeight="800" letterSpacing="0.5">ATHLETICS 19</text>
            {/* Slogan small subtitle below */}
            <text x="127" y="122" fill="#8E8E93" fontFamily="var(--font-mono)" fontSize="6" opacity="0.8">GHL ATHLETIC CORPS</text>
            <circle cx="141" cy="132" r="2" fill="#D9FE00" />
          </g>
        );

      case 'ghl-battlefield-tee':
        return (
          <g transform="translate(10, 10) scale(0.9)">
            {/* T-Shirt in Sand-dyed army hue */}
            <path d="M 60,70 L 100,50 L 130,60 L 152,60 L 182,50 L 222,70 L 198,118 L 178,112 L 178,225 L 104,225 L 104,112 L 84,118 Z" fill="#2E2B24" stroke="#8E8E93" strokeWidth="2.5" />
            {/* Neckband distressed stitch */}
            <path d="M 130,60 C 130,73 152,73 152,60" fill="none" stroke="#5C5648" strokeWidth="2.5" strokeDasharray="3,1" />
            {/* Tactical Grid / Target crosshair coordinate layout in Neon on the center chest */}
            <circle cx="141" cy="115" r="15" fill="none" stroke="#D9FE00" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="120" y1="115" x2="162" y2="115" stroke="#D9FE00" strokeWidth="0.75" />
            <line x1="141" y1="94" x2="141" y2="136" stroke="#D9FE00" strokeWidth="0.75" />
            <text x="124" y="145" fill="#D9FE00" fontFamily="var(--font-mono)" fontSize="6" fontWeight="bold">COORD 19.101.GHL</text>
            {/* Back screen print preview in a small inset box in corner if detail view is active */}
            <g transform="translate(142, 170)">
              <rect x="0" y="0" width="30" height="40" fill="#121212" stroke="#D9FE00" strokeWidth="1" />
              <text x="2" y="12" fill="#D9FE00" fontFamily="var(--font-mono)" fontSize="3">THROUGH</text>
              <text x="2" y="20" fill="#D9FE00" fontFamily="var(--font-mono)" fontSize="3">EVERY DARK</text>
              <text x="2" y="28" fill="#D9FE00" fontFamily="var(--font-mono)" fontSize="3">NIGHT...</text>
            </g>
          </g>
        );

      case 'ghl-crowned-chaos':
        return (
          <g transform="translate(10, 10) scale(0.9)">
            {/* Body */}
            <path d="M 70,80 L 100,60 L 130,70 L 150,75 L 160,70 L 190,60 L 220,80 L 205,100 L 185,95 L 185,210 L 105,210 L 105,95 L 85,100 Z" fill="#1E1E1F" stroke="#8E8E93" strokeWidth="2.5" />
            {/* Contrast-blocked Long Sleeves - highlight in heavy darker charcoal representing premium panel blocking */}
            <path d="M 85,100 L 45,185 L 60,192 L 105,110" fill="#141416" stroke="#8E8E93" strokeWidth="2.5" />
            <path d="M 205,100 L 245,185 L 230,192 L 185,110" fill="#141416" stroke="#8E8E93" strokeWidth="2.5" />
            {/* Bold text print elements along the sleeves */}
            <g transform="translate(48, 160) rotate(-65)">
              <text x="0" y="0" fill="#D9FE00" fontFamily="var(--font-display)" fontSize="7" fontWeight="bold" letterSpacing="1">CHAOS</text>
            </g>
            <g transform="translate(230, 120) rotate(65)">
              <text x="0" y="0" fill="#D9FE00" fontFamily="var(--font-display)" fontSize="7" fontWeight="bold" letterSpacing="1">CROWNED</text>
            </g>
            {/* Crewneck collar line */}
            <path d="M 130,70 Q 145,82 160,70" fill="none" stroke="#8E8E93" strokeWidth="2.5" />
          </g>
        );

      case 'ghl-snapback-original':
        return (
          <g transform="translate(10, 10) scale(0.9)">
            {/* Structured high panel flat brim Snapback cap */}
            <path d="M 60,110 C 60,50 100,45 140,45 C 180,45 220,50 220,110 Z" fill="#141416" stroke="#8E8E93" strokeWidth="2.5" />
            {/* Flat brim standing out straight */}
            <path d="M 50,110 L 15,110 C 13,124 45,123 60,118" fill="#111" stroke="#8E8E93" strokeWidth="2" />
            {/* Front embroidery styling */}
            <text x="100" y="85" fill="#D9FE00" fontFamily="var(--font-display)" fontSize="15" fontWeight="900" letterSpacing="0.5">GHL 19</text>
            <text x="94" y="97" fill="#8E8E93" fontFamily="var(--font-mono)" fontSize="6" letterSpacing="1">SINCE DAY ONE</text>
            {/* Top crown button */}
            <ellipse cx="140" cy="45" rx="5" ry="2.5" fill="#D9FE00" stroke="#111" />
            {/* Inner neon brim glow indicator */}
            <path d="M 15,110 C 35,113 50,111 60,114" fill="none" stroke="#D9FE00" strokeWidth="1.5" />
          </g>
        );

      case 'ghl-soft-tee':
        return (
          <g transform="translate(10, 10) scale(0.9)">
            {/* Standard clean white/cream tee contour */}
            <path d="M 60,70 L 100,50 L 130,60 L 152,60 L 182,50 L 222,70 L 198,118 L 178,112 L 178,225 L 104,225 L 104,112 L 84,118 Z" fill="#ECECF0" stroke="#8E8E93" strokeWidth="2.5" />
            {/* Neck line */}
            <path d="M 130,60 C 130,73 152,73 152,60" fill="none" stroke="#222" strokeWidth="2" />
            {/* Small center tiny OFT embroidery letter */}
            <text x="135" y="77" fill="#111" fontFamily="var(--font-display)" fontSize="7" fontWeight="bold">ghl.</text>
            {/* Soft shadow drapes */}
            <path d="M 104,115 C 115,125 150,125 178,115" fill="none" stroke="#D1D1D6" strokeWidth="1.5" opacity="0.6" />
          </g>
        );

      case 'ghl-denim-archive':
        return (
          <g transform="translate(10, 10) scale(0.9)">
            {/* Waistband */}
            <path d="M 85,50 L 195,50 L 195,65 L 85,65 Z" fill="#2C2C2E" stroke="#8E8E93" strokeWidth="2.5" />
            {/* Legs, slight baggy flare stack */}
            <path d="M 85,65 L 135,110 L 130,220 L 85,225 L 80,110 Z" fill="#1A212D" stroke="#55555C" strokeWidth="2" />
            <path d="M 195,65 L 145,110 L 150,220 L 195,225 L 200,110 Z" fill="#1A212D" stroke="#55555C" strokeWidth="2" />
            {/* Whiskering scrape effects on raw denim */}
            <g opacity="0.3" stroke="#F8F8FA" strokeWidth="1.2">
              <line x1="90" y1="80" x2="115" y2="85" />
              <line x1="90" y1="92" x2="110" y2="94" />
              <line x1="190" y1="80" x2="165" y2="85" />
              <line x1="190" y1="92" x2="170" y2="94" />
            </g>
            {/* Archive stamped emblem */}
            <rect x="145" y="53" width="22" height="10" rx="1" fill="#D9FE00" />
            <text x="147" y="61" fill="#111" fontFamily="var(--font-mono)" fontSize="5" fontWeight="bold">ARC-19</text>
          </g>
        );

      case 'ghl-tee26-archive':
        return (
          <g transform="translate(10, 10) scale(0.9)">
            {/* T-shirt charcoal base */}
            <path d="M 60,70 L 100,50 L 130,60 L 152,60 L 182,50 L 222,70 L 198,118 L 178,112 L 178,225 L 104,225 L 104,112 L 84,118 Z" fill="#141416" stroke="#444" strokeWidth="2" />
            {/* Stash/Archive stamp print */}
            <g transform="translate(115, 100)">
              <rect x="0" y="0" width="52" height="60" fill="none" stroke="#D9FE00" strokeWidth="1.5" strokeDasharray="3,3" />
              <text x="7" y="38" fill="#D9FE00" fontFamily="var(--font-display)" fontSize="34" fontWeight="900" opacity="0.8">26</text>
              <line x1="5" y1="45" x2="47" y2="45" stroke="#D9FE00" strokeWidth="1.5" />
              <text x="6" y="55" fill="#8E8E93" fontFamily="var(--font-mono)" fontSize="5">ARCHIVE SPEC-19</text>
            </g>
          </g>
        );

      case 'ghl-belt-archive':
        return (
          <g transform="translate(10, 10) scale(0.9)">
            {/* Folded heavy industrial belt strap */}
            <path d="M 40,110 C 40,100 60,95 130,95 C 200,95 220,105 220,115 C 220,125 190,135 130,135 Z" fill="none" stroke="#1A1A1E" strokeWidth="18" />
            <path d="M 40,110 C 40,100 60,95 130,95 C 200,95 220,105 220,115 C 220,125 190,135 130,135 Z" fill="none" stroke="#D1D1D6" strokeWidth="16" />
            {/* Double stitch lines on strap */}
            <path d="M 40,110 C 40,100 60,95 130,95 C 200,95 220,105 220,115" fill="none" stroke="#D9FE00" strokeWidth="1" strokeDasharray="3,3" />
            {/* Large tactical seatbelt buckle locking mechanism */}
            <g transform="translate(105, 100)">
              <rect x="0" y="0" width="50" height="30" rx="3" fill="#111" stroke="#8E8E93" strokeWidth="2.5" />
              <rect x="18" y="-5" width="14" height="6" fill="#D9FE00" rx="1" /> {/* Gold unlock level button */}
              <text x="6" y="16" fill="#F8F8FA" fontFamily="var(--font-display)" fontSize="8" fontWeight="bold">GHL LOCK</text>
              <text x="6" y="24" fill="#D9FE00" fontFamily="var(--font-mono)" fontSize="5">RELEASE TENSION</text>
            </g>
          </g>
        );

      case 'ghl-stoned-pant-archive':
        return (
          <g transform="translate(10, 10) scale(0.9)">
            {/* Cargo Pants layout */}
            <path d="M 85,50 L 195,50 L 195,65 L 85,65 Z" fill="#2C2C2E" stroke="#555" strokeWidth="2" />
            {/* Legs */}
            <path d="M 85,65 L 135,110 L 130,220 L 85,225 L 80,110 Z" fill="#252B24" stroke="#8E8E93" strokeWidth="2.5" />
            <path d="M 195,65 L 145,110 L 150,220 L 195,225 L 200,110 Z" fill="#252B24" stroke="#8E8E93" strokeWidth="2.5" />
            {/* Side 3D cargo pockets with snaps */}
            <path d="M 72,120 L 88,122 L 88,155 L 70,152 Z" fill="#1B1F1A" stroke="#8E8E93" strokeWidth="2" />
            <circle cx="79" cy="128" r="2.5" fill="#D9FE00" />
            <path d="M 210,120 L 194,122 L 194,155 L 212,152 Z" fill="#1B1F1A" stroke="#8E8E93" strokeWidth="2" />
            <circle cx="203" cy="128" r="2.5" fill="#D9FE00" />
            {/* Puddle cuffs ankle ribbons drawing */}
            <path d="M 85,225 C 90,230 110,232 110,223 C 110,215 118,220 125,221" fill="none" stroke="#444" strokeWidth="1.5" />
            <circle cx="110" cy="225" r="1.5" fill="#D9FE00" />
          </g>
        );

      default:
        return (
          <g transform="translate(10, 10) scale(0.9)">
            {/* Fallback classy streetwear graphics icon */}
            <rect x="50" y="50" width="180" height="150" fill="#1C1C1E" stroke="#8E8E93" strokeWidth="2" />
            <line x1="50" y1="50" x2="230" y2="200" stroke="#2C2C30" strokeWidth="1.5" />
            <line x1="230" y1="50" x2="50" y2="200" stroke="#2C2C30" strokeWidth="1.5" />
            <text x="95" y="115" fill="#D9FE00" fontFamily="var(--font-display)" fontSize="20" fontWeight="bold">OFF THUG</text>
            <text x="110" y="132" fill="#555" fontFamily="var(--font-mono)" fontSize="10">UNRELEASED</text>
            <rect x="118" y="145" width="44" height="14" fill="#222" stroke="#D9FE00" strokeWidth="1" />
            <text x="123" y="154" fill="#D9FE00" fontFamily="var(--font-mono)" fontSize="6">SPECIFIER 1.0</text>
          </g>
        );
    }
  };

  return (
    <div className={`relative flex items-center justify-center aspect-square rounded-2xl overflow-hidden bg-brand-darkgray text-brand-lightgray border border-brand-midgray/40 hover:border-brand-neon/30 transition-all duration-300 select-none ${className}`}>
      {/* Background brand grid design pattern */}
      {!hasImage && renderGrid()}

      {hasImage ? (
        <img
          src={imageSrc}
          alt={productId}
          className={`w-full h-full object-cover relative z-10 ${isDetailView ? 'scale-105' : 'scale-100'} transition-transform duration-500`}
        />
      ) : (
        /* SVG drawing content */
        <svg
          className={`w-4/5 h-4/5 object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] ${isDetailView ? 'scale-110' : 'scale-100'} transition-transform duration-500`}
          viewBox="0 0 280 280"
          xmlns="http://www.w3.org/2000/svg"
        >
          {getVectorContent()}
        </svg>
      )}

      {/* Decorative Brand Corner Tagging */}
      <span className="absolute bottom-2 left-3 font-mono text-[7px] tracking-widest text-[#5e5e66]/80 uppercase pointer-events-none z-20">
        GHL_TECHSTUDIO / {productId.toUpperCase().replaceAll('-', '_')}
      </span>
      {isDetailView && (
        <span className="absolute top-2 right-3 font-mono text-[7px] text-[#D9FE00] animate-pulse pointer-events-none z-20">
          ● REALTIME RENDERING ENGINE
        </span>
      )}
    </div>
  );
};
