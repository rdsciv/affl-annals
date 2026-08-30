"""
Generates clean vector SVG marks for all AFFL franchises.
"""

from pathlib import Path

LOGOS_DIR = Path(__file__).resolve().parent.parent / "public" / "assets" / "logos"
LOGOS_DIR.mkdir(parents=True, exist_ok=True)

FRANCHISE_LOGOS = {
    "skinners.svg": {
        "name": "Squaw Valley Skinners",
        "code": "SVS",
        "bg": "#ff6a00",
        "fg": "#08090c",
        "accent": "#00a2ff",
        "symbol": "M 35 65 L 50 25 L 65 65 Z M 44 52 L 56 52"
    },
    "fatcats.svg": {
        "name": "Fairview Fat Cats",
        "code": "FFC",
        "bg": "#ffc400",
        "fg": "#08090c",
        "accent": "#1c2536",
        "symbol": "M 30 40 Q 50 20 70 40 Q 80 60 70 75 Q 50 85 30 75 Q 20 60 30 40 Z"
    },
    "gringos.svg": {
        "name": "Goleta Gringos",
        "code": "GGG",
        "bg": "#00a2ff",
        "fg": "#08090c",
        "accent": "#c8ff00",
        "symbol": "M 25 55 Q 50 30 75 55 L 70 70 Q 50 50 30 70 Z"
    },
    "shadowcocks.svg": {
        "name": "San Diego Shadowcöcks",
        "code": "SDS",
        "bg": "#7928ca",
        "fg": "#eef4ff",
        "accent": "#ff0080",
        "symbol": "M 50 25 L 75 50 L 50 75 L 25 50 Z"
    },
    "cucks.svg": {
        "name": "DC Mighty Cucks",
        "code": "DCMC",
        "bg": "#e02424",
        "fg": "#eef4ff",
        "accent": "#3f83f8",
        "symbol": "M 30 30 L 70 30 L 50 75 Z"
    },
    "feelers.svg": {
        "name": "Grand Teeton Feelers",
        "code": "GTF",
        "bg": "#c8ff00",
        "fg": "#08090c",
        "accent": "#00a2ff",
        "symbol": "M 25 70 L 40 30 L 55 60 L 70 35 L 80 70 Z"
    },
    "warlords.svg": {
        "name": "Westeros Warlords",
        "code": "WWL",
        "bg": "#d97706",
        "fg": "#08090c",
        "accent": "#4b5563",
        "symbol": "M 30 70 L 30 35 L 50 25 L 70 35 L 70 70 Z"
    },
    "sanchitos.svg": {
        "name": "Tijuana Sanchitos",
        "code": "TJS",
        "bg": "#10b981",
        "fg": "#08090c",
        "accent": "#f59e0b",
        "symbol": "M 25 65 Q 50 20 75 65 Z"
    },
    "pipers.svg": {
        "name": "Patagonia Pipers",
        "code": "PTP",
        "bg": "#06b6d4",
        "fg": "#08090c",
        "accent": "#ec4899",
        "symbol": "M 35 30 L 65 30 L 50 75 Z"
    },
    "horndogs.svg": {
        "name": "Honolulu Horndogs",
        "code": "HLH",
        "bg": "#8b5cf6",
        "fg": "#eef4ff",
        "accent": "#38bdf8",
        "symbol": "M 30 45 Q 50 20 70 45 Q 60 75 30 45 Z"
    },
    "gabagooners.svg": {
        "name": "Central Oregon Gabagooners",
        "code": "COG",
        "bg": "#ec4899",
        "fg": "#08090c",
        "accent": "#f97316",
        "symbol": "M 50 25 A 25 25 0 1 0 50 75 A 25 25 0 1 0 50 25 Z"
    },
    "chupacabras.svg": {
        "name": "Chula Vista Chupacabras",
        "code": "CVC",
        "bg": "#14b8a6",
        "fg": "#08090c",
        "accent": "#6366f1",
        "symbol": "M 30 65 L 50 30 L 70 65 L 50 55 Z"
    },
    "pounders.svg": {
        "name": "Pasco Pounders",
        "code": "PND",
        "bg": "#64748b",
        "fg": "#eef4ff",
        "accent": "#94a3b8",
        "symbol": "M 30 35 L 70 35 L 70 65 L 30 65 Z"
    },
    "pollywogs.svg": {
        "name": "Poulsbo Pollywogs",
        "code": "PLW",
        "bg": "#22c55e",
        "fg": "#08090c",
        "accent": "#15803d",
        "symbol": "M 50 30 Q 75 50 50 70 Q 25 50 50 30 Z"
    },
}

for filename, cfg in FRANCHISE_LOGOS.items():
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="grad_{cfg['code']}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{cfg['bg']}" />
      <stop offset="100%" stop-color="{cfg['accent']}" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="20" fill="url(#grad_{cfg['code']})" />
  <rect x="3" y="3" width="94" height="94" rx="17" fill="none" stroke="#ffffff" stroke-width="2" stroke-opacity="0.2" />
  <path d="{cfg['symbol']}" fill="{cfg['fg']}" stroke="{cfg['fg']}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" fill-opacity="0.85" />
  <text x="50" y="88" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="12" fill="{cfg['fg']}" text-anchor="middle" letter-spacing="1">{cfg['code']}</text>
</svg>'''
    dest = LOGOS_DIR / filename
    with open(dest, "w") as f:
        f.write(svg_content)
    print(f"Generated {filename}")

print("All franchise vector logos generated successfully in public/assets/logos/")
