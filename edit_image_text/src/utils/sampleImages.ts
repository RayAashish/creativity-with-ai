import { SampleImage } from '../types';

function createSvgDataUrl(svgString: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}

// 1. Classic Meme
const memeSvg = `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="memeBg" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#3b4252" />
      <stop offset="50%" stop-color="#2e3440" />
      <stop offset="100%" stop-color="#1e222a" />
    </radialGradient>
    <linearGradient id="spotlight" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#88c0d0" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#2e3440" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#memeBg)"/>
  <circle cx="400" cy="270" r="160" fill="url(#spotlight)"/>
  
  <!-- Stylized Character / Mascot silhouette -->
  <circle cx="400" cy="230" r="90" fill="#4c566a" />
  <ellipse cx="400" cy="380" rx="150" ry="120" fill="#434c5e" />
  <!-- Big animated expressive eyes -->
  <ellipse cx="360" cy="220" rx="28" ry="34" fill="#eceff4"/>
  <circle cx="366" cy="220" r="15" fill="#2e3440"/>
  <circle cx="372" cy="214" r="5" fill="#ffffff"/>
  
  <ellipse cx="440" cy="220" rx="28" ry="34" fill="#eceff4"/>
  <circle cx="434" cy="220" r="15" fill="#2e3440"/>
  <circle cx="438" cy="214" r="5" fill="#ffffff"/>

  <!-- Dramatic mouth -->
  <path d="M 360 270 Q 400 310 440 270 Z" fill="#bf616a"/>
  
  <!-- Text Elements with high contrast -->
  <text x="400" y="80" font-family="'Impact', 'Arial Black', sans-serif" font-size="48" font-weight="900" fill="#ffffff" stroke="#000000" stroke-width="3" text-anchor="middle" letter-spacing="2">ONE DOES NOT SIMPLY</text>
  <text x="400" y="540" font-family="'Impact', 'Arial Black', sans-serif" font-size="46" font-weight="900" fill="#ffffff" stroke="#000000" stroke-width="3" text-anchor="middle" letter-spacing="2">EDIT TEXT IN AN IMAGE</text>
</svg>
`;

// 2. Cafe Menu Card
const cafeMenuSvg = `
<svg width="800" height="900" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="paperBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fffdfa"/>
      <stop offset="100%" stop-color="#f5ede0"/>
    </linearGradient>
  </defs>
  <rect width="800" height="900" fill="url(#paperBg)"/>
  
  <!-- Decorative border -->
  <rect x="25" y="25" width="750" height="850" fill="none" stroke="#6d4c41" stroke-width="2" rx="10"/>
  <rect x="35" y="35" width="730" height="830" fill="none" stroke="#8d6e63" stroke-width="1" stroke-dasharray="6,4" rx="8"/>
  
  <!-- Header -->
  <text x="400" y="90" font-family="'Georgia', serif" font-size="20" font-style="italic" fill="#8d6e63" text-anchor="middle" letter-spacing="4">WELCOME TO</text>
  <text x="400" y="145" font-family="'Georgia', serif" font-size="46" font-weight="bold" fill="#3e2723" text-anchor="middle" letter-spacing="2">RUSTIC ROAST CAFE</text>
  <text x="400" y="180" font-family="'Arial', sans-serif" font-size="14" fill="#795548" text-anchor="middle" letter-spacing="6">SPECIALTY COFFEE &amp; BAKERY</text>
  <line x1="150" y1="205" x2="650" y2="205" stroke="#a1887f" stroke-width="1.5"/>

  <!-- Section 1 -->
  <text x="400" y="260" font-family="'Georgia', serif" font-size="28" font-weight="bold" fill="#4e342e" text-anchor="middle">ESPRESSO BAR</text>
  
  <text x="120" y="315" font-family="'Helvetica', sans-serif" font-size="22" font-weight="bold" fill="#3e2723">Signature Flat White</text>
  <text x="680" y="315" font-family="'Helvetica', sans-serif" font-size="22" font-weight="bold" fill="#6d4c41" text-anchor="end">$4.75</text>
  <text x="120" y="340" font-family="'Helvetica', sans-serif" font-size="15" fill="#8d6e63">Double ristretto, velvety microfoam milk</text>

  <text x="120" y="395" font-family="'Helvetica', sans-serif" font-size="22" font-weight="bold" fill="#3e2723">Caramel Cold Brew</text>
  <text x="680" y="395" font-family="'Helvetica', sans-serif" font-size="22" font-weight="bold" fill="#6d4c41" text-anchor="end">$5.25</text>
  <text x="120" y="420" font-family="'Helvetica', sans-serif" font-size="15" fill="#8d6e63">18-hour slow steep with salted caramel foam</text>

  <text x="120" y="475" font-family="'Helvetica', sans-serif" font-size="22" font-weight="bold" fill="#3e2723">Ceremonial Matcha Latte</text>
  <text x="680" y="475" font-family="'Helvetica', sans-serif" font-size="22" font-weight="bold" fill="#6d4c41" text-anchor="end">$5.50</text>
  <text x="120" y="500" font-family="'Helvetica', sans-serif" font-size="15" fill="#8d6e63">Uji organic matcha, oat milk, honey</text>

  <!-- Section 2 -->
  <line x1="250" y1="550" x2="550" y2="550" stroke="#d7ccc8" stroke-width="1"/>
  <text x="400" y="600" font-family="'Georgia', serif" font-size="28" font-weight="bold" fill="#4e342e" text-anchor="middle">FRESH PASTRIES</text>

  <text x="120" y="655" font-family="'Helvetica', sans-serif" font-size="22" font-weight="bold" fill="#3e2723">Butter Croissant</text>
  <text x="680" y="655" font-family="'Helvetica', sans-serif" font-size="22" font-weight="bold" fill="#6d4c41" text-anchor="end">$3.75</text>
  <text x="120" y="680" font-family="'Helvetica', sans-serif" font-size="15" fill="#8d6e63">Flaky artisanal French pastry baked fresh</text>

  <text x="120" y="735" font-family="'Helvetica', sans-serif" font-size="22" font-weight="bold" fill="#3e2723">Avocado Sourdough Toast</text>
  <text x="680" y="735" font-family="'Helvetica', sans-serif" font-size="22" font-weight="bold" fill="#6d4c41" text-anchor="end">$9.50</text>
  <text x="120" y="760" font-family="'Helvetica', sans-serif" font-size="15" fill="#8d6e63">Hass avocado, chili flakes, micro greens</text>

  <text x="400" y="830" font-family="'Georgia', serif" font-size="16" font-style="italic" fill="#8d6e63" text-anchor="middle">Open Daily 7:00 AM - 6:00 PM • Free Wi-Fi</text>
</svg>
`;

// 3. Cyber Sale Banner
const saleBannerSvg = `
<svg width="900" height="500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="saleBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#31104b"/>
    </linearGradient>
    <linearGradient id="neonText" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f43f5e"/>
      <stop offset="50%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>
  </defs>
  <rect width="900" height="500" fill="url(#saleBg)"/>
  
  <!-- Glowing circles -->
  <circle cx="150" cy="120" r="140" fill="#38bdf8" opacity="0.12" filter="blur(40px)"/>
  <circle cx="780" cy="380" r="160" fill="#f43f5e" opacity="0.15" filter="blur(50px)"/>

  <!-- Badge -->
  <rect x="360" y="60" width="180" height="38" rx="19" fill="#ef4444"/>
  <text x="450" y="85" font-family="'Arial', sans-serif" font-size="15" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="2">LIMITED TIME ONLY</text>

  <!-- Title -->
  <text x="450" y="175" font-family="'Arial Black', 'Impact', sans-serif" font-size="68" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="3">MEGA SALE</text>
  <text x="450" y="245" font-family="'Arial Black', sans-serif" font-size="48" font-weight="bold" fill="url(#neonText)" text-anchor="middle">UP TO 60% OFF</text>
  
  <text x="450" y="310" font-family="'Arial', sans-serif" font-size="20" fill="#cbd5e1" text-anchor="middle">Upgrade your creative gear before midnight</text>

  <!-- Button Box -->
  <rect x="340" y="360" width="220" height="54" rx="27" fill="#fbbf24"/>
  <text x="450" y="395" font-family="'Arial', sans-serif" font-size="20" font-weight="bold" fill="#0f172a" text-anchor="middle" letter-spacing="1">SHOP NOW</text>

  <text x="450" y="450" font-family="'Arial', sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle">Use Promo Code: SUPER2026</text>
</svg>
`;

// 4. Inspiring Quote
const quoteSvg = `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sunset" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="40%" stop-color="#4338ca"/>
      <stop offset="70%" stop-color="#db2777"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#sunset)"/>
  
  <!-- Silhouette mountains -->
  <polygon points="0,600 180,420 380,520 540,390 720,490 800,430 800,600" fill="#090a0f" opacity="0.9"/>
  <polygon points="0,600 240,480 480,560 680,470 800,530 800,600" fill="#020408"/>

  <!-- Quotation marks -->
  <text x="400" y="160" font-family="'Georgia', serif" font-size="90" font-weight="bold" fill="#ffffff" opacity="0.3" text-anchor="middle">“</text>

  <!-- Main Quote Text -->
  <text x="400" y="240" font-family="'Playfair Display', 'Georgia', serif" font-size="38" font-weight="bold" font-style="italic" fill="#ffffff" text-anchor="middle">Believe you can</text>
  <text x="400" y="300" font-family="'Playfair Display', 'Georgia', serif" font-size="38" font-weight="bold" font-style="italic" fill="#ffffff" text-anchor="middle">and you're halfway there.</text>

  <line x1="320" y1="350" x2="480" y2="350" stroke="#fbcfe8" stroke-width="2" opacity="0.8"/>
  <text x="400" y="390" font-family="'Helvetica Neue', 'Arial', sans-serif" font-size="18" font-weight="600" fill="#fde68a" text-anchor="middle" letter-spacing="3">— THEODORE ROOSEVELT</text>
</svg>
`;

// 5. Concert / Event Poster
const eventPosterSvg = `
<svg width="700" height="950" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="posterBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a0a"/>
      <stop offset="100%" stop-color="#18181b"/>
    </linearGradient>
  </defs>
  <rect width="700" height="950" fill="url(#posterBg)"/>
  
  <!-- Graphic neon shapes -->
  <circle cx="350" cy="340" r="180" fill="none" stroke="#6366f1" stroke-width="6" opacity="0.8"/>
  <circle cx="350" cy="340" r="140" fill="none" stroke="#ec4899" stroke-width="4" stroke-dasharray="12,12" opacity="0.7"/>
  <circle cx="350" cy="340" r="100" fill="#6366f1" opacity="0.2"/>

  <!-- Event Header -->
  <text x="350" y="90" font-family="'Arial', sans-serif" font-size="16" font-weight="bold" fill="#a1a1aa" text-anchor="middle" letter-spacing="6">LIVE IN CONCERT</text>
  
  <!-- Main Band Name -->
  <text x="350" y="290" font-family="'Arial Black', sans-serif" font-size="52" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="4">NEON HORIZON</text>
  <text x="350" y="340" font-family="'Arial', sans-serif" font-size="20" font-weight="bold" fill="#38bdf8" text-anchor="middle" letter-spacing="8">WORLD TOUR 2026</text>

  <rect x="220" y="380" width="260" height="42" fill="#ec4899" rx="6"/>
  <text x="350" y="407" font-family="'Arial Black', sans-serif" font-size="18" fill="#ffffff" text-anchor="middle" letter-spacing="2">SPECIAL GUEST: THE VOID</text>

  <!-- Details -->
  <line x1="100" y1="520" x2="600" y2="520" stroke="#3f3f46" stroke-width="1"/>
  
  <text x="350" y="580" font-family="'Georgia', serif" font-size="32" font-weight="bold" fill="#f43f5e" text-anchor="middle">FRIDAY, AUGUST 14</text>
  <text x="350" y="620" font-family="'Arial', sans-serif" font-size="20" fill="#ffffff" text-anchor="middle">DOORS OPEN AT 7:30 PM</text>
  <text x="350" y="660" font-family="'Arial', sans-serif" font-size="22" font-weight="bold" fill="#e4e4e7" text-anchor="middle">GRAND METRO ARENA</text>
  <text x="350" y="695" font-family="'Arial', sans-serif" font-size="15" fill="#a1a1aa" text-anchor="middle">SAN FRANCISCO, CALIFORNIA</text>

  <rect x="200" y="770" width="300" height="54" rx="27" fill="#6366f1"/>
  <text x="350" y="804" font-family="'Arial Black', sans-serif" font-size="18" fill="#ffffff" text-anchor="middle" letter-spacing="2">GET TICKETS AT ARENA.IO</text>

  <text x="350" y="880" font-family="'Arial', sans-serif" font-size="13" fill="#71717a" text-anchor="middle">ALL AGES WELCOME • VALID ID REQUIRED AT ENTRY</text>
</svg>
`;

// 6. Business Card
const businessCardSvg = `
<svg width="850" height="500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cardBg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="850" height="500" rx="16" fill="url(#cardBg)"/>
  
  <!-- Gold Accent Line -->
  <rect x="70" y="70" width="8" height="360" fill="#f59e0b" rx="4"/>

  <!-- Logo Mark -->
  <circle cx="140" cy="130" r="32" fill="#3b82f6"/>
  <text x="140" y="142" font-family="'Arial Black', sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle">V</text>

  <!-- Name & Title -->
  <text x="195" y="130" font-family="'Helvetica Neue', 'Arial', sans-serif" font-size="34" font-weight="bold" fill="#ffffff">SARAH CONNOR</text>
  <text x="195" y="160" font-family="'Helvetica Neue', 'Arial', sans-serif" font-size="16" font-weight="600" fill="#38bdf8" letter-spacing="2">CHIEF TECHNOLOGY OFFICER</text>
  <text x="195" y="185" font-family="'Helvetica Neue', 'Arial', sans-serif" font-size="14" fill="#94a3b8">NEXUS AI SOLUTIONS INC.</text>

  <line x1="120" y1="230" x2="750" y2="230" stroke="#334155" stroke-width="1.5"/>

  <!-- Contact Info -->
  <text x="140" y="280" font-family="'Helvetica', sans-serif" font-size="18" fill="#e2e8f0">Email: sarah.connor@nexusai.com</text>
  <text x="140" y="325" font-family="'Helvetica', sans-serif" font-size="18" fill="#e2e8f0">Phone: +1 (555) 234-8901</text>
  <text x="140" y="370" font-family="'Helvetica', sans-serif" font-size="18" fill="#e2e8f0">Web: www.nexusai-solutions.com</text>

  <text x="750" y="420" font-family="'Helvetica', sans-serif" font-size="14" fill="#64748b" text-anchor="end">SAN FRANCISCO • NEW YORK • TOKYO</text>
</svg>
`;

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'sample-meme',
    title: 'Internet Meme',
    category: 'Meme',
    description: 'Iconic meme template with top & bottom punchline ready to edit.',
    url: createSvgDataUrl(memeSvg),
    thumbnail: createSvgDataUrl(memeSvg),
    defaultBlocks: [
      {
        id: 'blk-meme-top',
        text: 'ONE DOES NOT SIMPLY',
        originalText: 'ONE DOES NOT SIMPLY',
        x: 100,
        y: 35,
        width: 600,
        height: 60,
        fontSize: 48,
        fontFamily: "'Anton', 'Impact', sans-serif",
        fontWeight: '900',
        color: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: 3,
        textAlign: 'center',
        isUpperCase: true,
        patchColor: '#2e3440',
        patchType: 'auto-solid',
        patchPadding: 12,
        patchFeather: 4,
        patchOpacity: 1,
        confidence: 99,
        isEdited: false,
        isLocked: false,
        isVisible: true,
      },
      {
        id: 'blk-meme-bot',
        text: 'EDIT TEXT IN AN IMAGE',
        originalText: 'EDIT TEXT IN AN IMAGE',
        x: 80,
        y: 495,
        width: 640,
        height: 60,
        fontSize: 46,
        fontFamily: "'Anton', 'Impact', sans-serif",
        fontWeight: '900',
        color: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: 3,
        textAlign: 'center',
        isUpperCase: true,
        patchColor: '#232731',
        patchType: 'auto-solid',
        patchPadding: 12,
        patchFeather: 4,
        patchOpacity: 1,
        confidence: 99,
        isEdited: false,
        isLocked: false,
        isVisible: true,
      },
    ],
  },
  {
    id: 'sample-menu',
    title: 'Cafe & Restaurant Menu',
    category: 'Menu',
    description: 'Vintage cafe menu with headers, item titles, prices & descriptions.',
    url: createSvgDataUrl(cafeMenuSvg),
    thumbnail: createSvgDataUrl(cafeMenuSvg),
    defaultBlocks: [
      {
        id: 'blk-menu-title',
        text: 'RUSTIC ROAST CAFE',
        originalText: 'RUSTIC ROAST CAFE',
        x: 150,
        y: 105,
        width: 500,
        height: 50,
        fontSize: 44,
        fontFamily: "'Playfair Display', serif",
        fontWeight: '700',
        color: '#3e2723',
        textAlign: 'center',
        patchColor: '#fcf8f2',
        patchType: 'auto-solid',
        patchPadding: 8,
        patchFeather: 2,
        patchOpacity: 1,
        confidence: 98,
        isEdited: false,
        isLocked: false,
        isVisible: true,
      },
      {
        id: 'blk-menu-item1',
        text: 'Signature Flat White',
        originalText: 'Signature Flat White',
        x: 115,
        y: 290,
        width: 250,
        height: 32,
        fontSize: 22,
        fontFamily: "'Inter', sans-serif",
        fontWeight: '700',
        color: '#3e2723',
        textAlign: 'left',
        patchColor: '#f9f3ea',
        patchType: 'auto-solid',
        patchPadding: 6,
        patchFeather: 2,
        patchOpacity: 1,
        confidence: 95,
        isEdited: false,
        isLocked: false,
        isVisible: true,
      },
      {
        id: 'blk-menu-price1',
        text: '$4.75',
        originalText: '$4.75',
        x: 615,
        y: 290,
        width: 70,
        height: 32,
        fontSize: 22,
        fontFamily: "'Inter', sans-serif",
        fontWeight: '700',
        color: '#6d4c41',
        textAlign: 'right',
        patchColor: '#f9f3ea',
        patchType: 'auto-solid',
        patchPadding: 6,
        patchFeather: 2,
        patchOpacity: 1,
        confidence: 97,
        isEdited: false,
        isLocked: false,
        isVisible: true,
      },
    ],
  },
  {
    id: 'sample-sale',
    title: 'Cyber Sale Banner',
    category: 'E-commerce',
    description: 'High-energy discount banner with promo code & call to action.',
    url: createSvgDataUrl(saleBannerSvg),
    thumbnail: createSvgDataUrl(saleBannerSvg),
    defaultBlocks: [
      {
        id: 'blk-sale-title',
        text: 'MEGA SALE',
        originalText: 'MEGA SALE',
        x: 200,
        y: 110,
        width: 500,
        height: 80,
        fontSize: 68,
        fontFamily: "'Anton', 'Impact', sans-serif",
        fontWeight: '900',
        color: '#ffffff',
        textAlign: 'center',
        patchColor: '#1d1945',
        patchType: 'auto-solid',
        patchPadding: 10,
        patchFeather: 6,
        patchOpacity: 1,
        confidence: 99,
        isEdited: false,
        isLocked: false,
        isVisible: true,
      },
      {
        id: 'blk-sale-pct',
        text: 'UP TO 60% OFF',
        originalText: 'UP TO 60% OFF',
        x: 250,
        y: 200,
        width: 400,
        height: 60,
        fontSize: 48,
        fontFamily: "'Anton', 'Impact', sans-serif",
        fontWeight: '700',
        color: '#fbbf24',
        textAlign: 'center',
        patchColor: '#241747',
        patchType: 'auto-solid',
        patchPadding: 8,
        patchFeather: 4,
        patchOpacity: 1,
        confidence: 98,
        isEdited: false,
        isLocked: false,
        isVisible: true,
      },
    ],
  },
  {
    id: 'sample-quote',
    title: 'Inspirational Quote',
    category: 'Social Media',
    description: 'Serif quote on a gradient landscape background.',
    url: createSvgDataUrl(quoteSvg),
    thumbnail: createSvgDataUrl(quoteSvg),
  },
  {
    id: 'sample-poster',
    title: 'Concert Tour Poster',
    category: 'Event',
    description: 'Electric music tour flyer with dates, venue & ticket info.',
    url: createSvgDataUrl(eventPosterSvg),
    thumbnail: createSvgDataUrl(eventPosterSvg),
  },
  {
    id: 'sample-card',
    title: 'Executive Business Card',
    category: 'Corporate',
    description: 'Dark-mode corporate business card with names and contacts.',
    url: createSvgDataUrl(businessCardSvg),
    thumbnail: createSvgDataUrl(businessCardSvg),
  },
];
