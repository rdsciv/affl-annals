"""
Canonical identity registry for the AFFL.
Binding rules:
- The owner/person is the durable AFFL franchise identity.
- An ESPN team slot is not an aggregation identity.
- Cumulative views use the current 2026 franchise name and logo.
- Historical team-season views use historical names and logos.
- Exact merges for Jason Kafka, Kevin Sliger, and Tanner Dunn are binding.
"""

from typing import Dict, List, Any

# Current 2026 Planning Field (12 Active Franchises)
CANONICAL_FRANCHISES = {
    "FRAN_SVS": {
        "franchise_id": "FRAN_SVS",
        "display_name": "Squaw Valley Skinners",
        "owner_id": "OWNER_SVS",
        "owner_display_name": "Squaw Valley Skinners Owner",
        "canonical_name": "Squaw Valley Skinners",
        "current_logo_path": "/assets/logos/skinners.svg",
        "primary_color": "#ff6a00",
        "secondary_color": "#00a2ff",
        "first_season": 2014,
        "last_season": 2026,
        "is_active": 1,
    },
    "FRAN_FFC": {
        "franchise_id": "FRAN_FFC",
        "display_name": "Fairview Fat Cats",
        "owner_id": "OWNER_FFC",
        "owner_display_name": "Fairview Fat Cats Owner",
        "canonical_name": "Fairview Fat Cats",
        "current_logo_path": "/assets/logos/fatcats.svg",
        "primary_color": "#ffc400",
        "secondary_color": "#1c2536",
        "first_season": 2014,
        "last_season": 2026,
        "is_active": 1,
    },
    "FRAN_GGG": {
        "franchise_id": "FRAN_GGG",
        "display_name": "Goleta Gringos",
        "owner_id": "OWNER_GGG",
        "owner_display_name": "Goleta Gringos Owner",
        "canonical_name": "Goleta Gringos",
        "current_logo_path": "/assets/logos/gringos.svg",
        "primary_color": "#00a2ff",
        "secondary_color": "#c8ff00",
        "first_season": 2014,
        "last_season": 2026,
        "is_active": 1,
    },
    "FRAN_SDS": {
        "franchise_id": "FRAN_SDS",
        "display_name": "San Diego Shadowcöcks",
        "owner_id": "OWNER_SDS",
        "owner_display_name": "San Diego Shadowcöcks Owner",
        "canonical_name": "San Diego Shadowcöcks",
        "current_logo_path": "/assets/logos/shadowcocks.svg",
        "primary_color": "#7928ca",
        "secondary_color": "#ff0080",
        "first_season": 2014,
        "last_season": 2026,
        "is_active": 1,
    },
    "FRAN_DCMC": {
        "franchise_id": "FRAN_DCMC",
        "display_name": "DC Mighty Cucks",
        "owner_id": "OWNER_DCMC",
        "owner_display_name": "DC Mighty Cucks Owner",
        "canonical_name": "DC Mighty Cucks",
        "current_logo_path": "/assets/logos/cucks.svg",
        "primary_color": "#e02424",
        "secondary_color": "#3f83f8",
        "first_season": 2014,
        "last_season": 2026,
        "is_active": 1,
    },
    "FRAN_GTF": {
        "franchise_id": "FRAN_GTF",
        "display_name": "Grand Teeton Feelers",
        "owner_id": "OWNER_GTF",
        "owner_display_name": "Grand Teeton Feelers Owner",
        "canonical_name": "Grand Teeton Feelers",
        "current_logo_path": "/assets/logos/feelers.svg",
        "primary_color": "#c8ff00",
        "secondary_color": "#00a2ff",
        "first_season": 2014,
        "last_season": 2026,
        "is_active": 1,
    },
    "FRAN_WWL": {
        "franchise_id": "FRAN_WWL",
        "display_name": "Westeros Warlords",
        "owner_id": "OWNER_WWL",
        "owner_display_name": "Westeros Warlords Owner",
        "canonical_name": "Westeros Warlords",
        "current_logo_path": "/assets/logos/warlords.svg",
        "primary_color": "#d97706",
        "secondary_color": "#4b5563",
        "first_season": 2014,
        "last_season": 2026,
        "is_active": 1,
    },
    "FRAN_TJS": {
        "franchise_id": "FRAN_TJS",
        "display_name": "Tijuana Sanchitos",
        "owner_id": "OWNER_TJS",
        "owner_display_name": "Tijuana Sanchitos Owner",
        "canonical_name": "Tijuana Sanchitos",
        "current_logo_path": "/assets/logos/sanchitos.svg",
        "primary_color": "#10b981",
        "secondary_color": "#f59e0b",
        "first_season": 2014,
        "last_season": 2026,
        "is_active": 1,
    },
    "FRAN_PTP": {
        "franchise_id": "FRAN_PTP",
        "display_name": "Patagonia Pipers",
        "owner_id": "OWNER_PTP",
        "owner_display_name": "Patagonia Pipers Owner",
        "canonical_name": "Patagonia Pipers",
        "current_logo_path": "/assets/logos/pipers.svg",
        "primary_color": "#06b6d4",
        "secondary_color": "#ec4899",
        "first_season": 2014,
        "last_season": 2026,
        "is_active": 1,
    },
    "FRAN_HLH": {
        "franchise_id": "FRAN_HLH",
        "display_name": "Honolulu Horndogs",
        "owner_id": "OWNER_HLH",
        "owner_display_name": "Honolulu Horndogs Owner",
        "canonical_name": "Honolulu Horndogs",
        "current_logo_path": "/assets/logos/horndogs.svg",
        "primary_color": "#8b5cf6",
        "secondary_color": "#38bdf8",
        "first_season": 2014,
        "last_season": 2026,
        "is_active": 1,
    },
    "FRAN_COG": {
        "franchise_id": "FRAN_COG",
        "display_name": "Central Oregon Gabagooners",
        "owner_id": "OWNER_COG",
        "owner_display_name": "Central Oregon Gabagooners Owner",
        "canonical_name": "Central Oregon Gabagooners",
        "current_logo_path": "/assets/logos/gabagooners.svg",
        "primary_color": "#ec4899",
        "secondary_color": "#f97316",
        "first_season": 2014,
        "last_season": 2026,
        "is_active": 1,
    },
    "FRAN_CVC": {
        "franchise_id": "FRAN_CVC",
        "display_name": "Chula Vista Chupacabras",
        "owner_id": "OWNER_CVC",
        "owner_display_name": "Chula Vista Chupacabras Owner",
        "canonical_name": "Chula Vista Chupacabras",
        "current_logo_path": "/assets/logos/chupacabras.svg",
        "primary_color": "#14b8a6",
        "secondary_color": "#6366f1",
        "first_season": 2014,
        "last_season": 2026,
        "is_active": 1,
    },
    # Alumni Franchises
    "FRAN_PND": {
        "franchise_id": "FRAN_PND",
        "display_name": "Pasco Pounders",
        "owner_id": "OWNER_PND",
        "owner_display_name": "Pasco Pounders Owner",
        "canonical_name": "Pasco Pounders",
        "current_logo_path": "/assets/logos/pounders.svg",
        "primary_color": "#64748b",
        "secondary_color": "#94a3b8",
        "first_season": 2014,
        "last_season": 2020,
        "is_active": 0,
    },
    "FRAN_PLW": {
        "franchise_id": "FRAN_PLW",
        "display_name": "Poulsbo Pollywogs",
        "owner_id": "OWNER_PLW",
        "owner_display_name": "Poulsbo Pollywogs Owner",
        "canonical_name": "Poulsbo Pollywogs",
        "current_logo_path": "/assets/logos/pollywogs.png",
        "primary_color": "#22c55e",
        "secondary_color": "#15803d",
        "first_season": 2014,
        "last_season": 2022,
        "is_active": 0,
    },
}

# Alias resolution mapping for known member names / aliases to durable franchise_id
MEMBER_FRANCHISE_MAP = {
    # Merges
    "jason kafka": "FRAN_DCMC",
    "kevin sliger": "FRAN_FFC",
    "tanner dunn": "FRAN_COG",
    
    # Common historical names / aliases
    "squaw valley skinners": "FRAN_SVS",
    "fairview fat cats": "FRAN_FFC",
    "goleta gringos": "FRAN_GGG",
    "san diego shadowcöcks": "FRAN_SDS",
    "san diego shadowcocks": "FRAN_SDS",
    "dc mighty cucks": "FRAN_DCMC",
    "grand teeton feelers": "FRAN_GTF",
    "westeros warlords": "FRAN_WWL",
    "tijuana sanchitos": "FRAN_TJS",
    "patagonia pipers": "FRAN_PTP",
    "honolulu horndogs": "FRAN_HLH",
    "central oregon gabagooners": "FRAN_COG",
    "chula vista chupacabras": "FRAN_CVC",
    "pasco pounders": "FRAN_PND",
    "poulsbo pollywogs": "FRAN_PLW",
    
    # Historical aliases
    "mad dawgs": "FRAN_SVS",
    "wake snakes": "FRAN_HLH",
    "chewbacca": "FRAN_WWL",
    "patriots": "FRAN_DCMC",
    "thunder": "FRAN_TJS",
}

def resolve_franchise_id(name_or_owner: str, default: str = None) -> str:
    if not name_or_owner:
        return default or "FRAN_UNKNOWN"
    norm = name_or_owner.strip().lower()
    for key, fid in MEMBER_FRANCHISE_MAP.items():
        if key in norm:
            return fid
    return default or "FRAN_UNKNOWN"
