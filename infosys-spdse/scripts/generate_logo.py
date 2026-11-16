import os
from PIL import Image, ImageDraw

# 1. Create public/logo-mark.svg
logo_mark_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f766e" />
      <stop offset="50%" stop-color="#0d9488" />
      <stop offset="100%" stop-color="#115e59" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5eead4" />
      <stop offset="100%" stop-color="#2dd4bf" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Rounded Hexagonal / Shield Base -->
  <polygon points="50,4 92,26 92,74 50,96 8,74 8,26" fill="url(#bgGrad)" stroke="#134e4a" stroke-width="2" />
  
  <!-- Subtle Internal Grid Hairlines -->
  <line x1="50" y1="4" x2="50" y2="96" stroke="#14b8a6" stroke-width="1" stroke-opacity="0.25" stroke-dasharray="3,3" />
  <line x1="8" y1="50" x2="92" y2="50" stroke="#14b8a6" stroke-width="1" stroke-opacity="0.25" stroke-dasharray="3,3" />

  <!-- Code Bracket Left < -->
  <path d="M 38,30 L 22,50 L 38,70" stroke="url(#accentGrad)" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round" />

  <!-- Code Bracket Right > -->
  <path d="M 62,30 L 78,50 L 62,70" stroke="url(#accentGrad)" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round" />

  <!-- Central Algorithmic Graph Nodes & S-P Polyline -->
  <!-- SP Interlocking Core: S-curve top to center, P loop right -->
  <path d="M 50,30 L 44,40 L 56,48 L 44,56 L 50,68" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
  
  <!-- Graph Branching Dots -->
  <circle cx="50" cy="30" r="4.5" fill="url(#goldGrad)" />
  <circle cx="44" cy="40" r="3.5" fill="#ffffff" />
  <circle cx="56" cy="48" r="4" fill="url(#accentGrad)" />
  <circle cx="44" cy="56" r="3.5" fill="#ffffff" />
  <circle cx="50" cy="68" r="5" fill="url(#goldGrad)" filter="url(#glow)" />
</svg>'''

with open('public/logo-mark.svg', 'w') as f:
    f.write(logo_mark_svg)

# 2. Create public/logo.svg (Horizontal Lockup with Typography)
logo_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" fill="none">
  <defs>
    <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f766e" />
      <stop offset="50%" stop-color="#0d9488" />
      <stop offset="100%" stop-color="#115e59" />
    </linearGradient>
    <linearGradient id="accentGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5eead4" />
      <stop offset="100%" stop-color="#2dd4bf" />
    </linearGradient>
    <linearGradient id="goldGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
  </defs>

  <!-- Left Icon Mark (x=8, y=8, size=64) -->
  <g transform="translate(6, 6) scale(0.68)">
    <polygon points="50,4 92,26 92,74 50,96 8,74 8,26" fill="url(#bgGrad2)" stroke="#134e4a" stroke-width="2.5" />
    <path d="M 38,30 L 22,50 L 38,70" stroke="url(#accentGrad2)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 62,30 L 78,50 L 62,70" stroke="url(#accentGrad2)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 50,30 L 44,40 L 56,48 L 44,56 L 50,68" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="50" cy="30" r="4.5" fill="url(#goldGrad2)" />
    <circle cx="56" cy="48" r="4" fill="url(#accentGrad2)" />
    <circle cx="50" cy="68" r="5" fill="url(#goldGrad2)" />
  </g>

  <!-- Brand Typography -->
  <!-- "SPDSE" -->
  <text x="86" y="47" font-family="'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="28" fill="#0f172a" letter-spacing="-0.5">SPDSE</text>
  
  <!-- ".Prep" Badge -->
  <text x="180" y="47" font-family="'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="28" fill="#0d9488" letter-spacing="-0.5">.Prep</text>

  <!-- Subtitle Tag -->
  <rect x="86" y="56" width="138" height="16" rx="3" fill="#f0fdfa" stroke="#ccfbf1" stroke-width="1" />
  <text x="92" y="68" font-family="'JetBrains Mono', monospace" font-weight="600" font-size="9" fill="#0f766e" letter-spacing="0.5">INFOSYS SP · DSE OA</text>
</svg>'''

with open('public/logo.svg', 'w') as f:
    f.write(logo_svg)

# 3. Generate PNG Icons (192 and 512)
for size in [192, 512]:
    img = Image.new('RGBA', (size, size), (250, 250, 249, 255)) # Warm paper bg
    d = ImageDraw.Draw(img)
    
    # Draw Hexagonal Shield
    cx, cy = size // 2, size // 2
    r = int(size * 0.44)
    import math
    points = []
    for i in range(6):
        angle = math.radians(60 * i - 30)
        px = cx + r * math.cos(angle)
        py = cy + r * math.sin(angle)
        points.append((px, py))
    
    # Fill Hexagon
    d.polygon(points, fill=(15, 118, 110, 255), outline=(17, 94, 89, 255))
    
    # Draw Brackets
    bw = int(size * 0.055)
    bracket_offset_x = int(size * 0.16)
    bracket_top_y = int(size * 0.32)
    bracket_mid_y = cy
    bracket_bot_y = int(size * 0.68)
    
    # Left <
    d.line([(cx - bracket_offset_x + bw, bracket_top_y), (cx - bracket_offset_x - bw, bracket_mid_y), (cx - bracket_offset_x + bw, bracket_bot_y)], fill=(94, 234, 212, 255), width=bw, joint='curve')
    # Right >
    d.line([(cx + bracket_offset_x - bw, bracket_top_y), (cx + bracket_offset_x + bw, bracket_mid_y), (cx + bracket_offset_x - bw, bracket_bot_y)], fill=(94, 234, 212, 255), width=bw, joint='curve')
    
    # Center S-P polyline
    d.line([(cx, int(size * 0.32)), (cx - int(size * 0.06), int(size * 0.42)), (cx + int(size * 0.06), int(size * 0.50)), (cx - int(size * 0.06), int(size * 0.58)), (cx, int(size * 0.68))], fill=(255, 255, 255, 255), width=int(size * 0.045), joint='curve')
    
    # Nodes
    dot_r = int(size * 0.038)
    d.ellipse([(cx - dot_r, int(size * 0.32) - dot_r), (cx + dot_r, int(size * 0.32) + dot_r)], fill=(245, 158, 11, 255))
    d.ellipse([(cx + int(size * 0.06) - dot_r, int(size * 0.50) - dot_r), (cx + int(size * 0.06) + dot_r, int(size * 0.50) + dot_r)], fill=(45, 212, 191, 255))
    d.ellipse([(cx - dot_r, int(size * 0.68) - dot_r), (cx + dot_r, int(size * 0.68) + dot_r)], fill=(245, 158, 11, 255))
    
    img.save(f'public/icon-{size}.png')

print("Generated logo assets: logo-mark.svg, logo.svg, icon-192.png, icon-512.png")
