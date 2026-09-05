"""
Canonical identity registry for the AFFL.
Binding rules:
- The owner/person is the durable AFFL franchise identity.
- An ESPN team slot is not an aggregation identity.
- Cumulative views use the current 2026 franchise name and logo.
- Historical team-season views use historical names and logos.
"""

from typing import Dict, List, Any

# Current 2026 Planning Field (12 Active Franchises)
CANONICAL_FRANCHISES = {
    "FRAN_SVS": {
        "franchise_id": "FRAN_SVS",
        "display_name": "Squaw Valley Skinners",
        "owner_id": "OWNER_SVS",
        "owner_display_name": "Chris Zweifel",
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
        "owner_display_name": "Alex Renney",
        "canonical_name": "Fairview Fat Cats",
        "current_logo_path": "/assets/logos/fatcats.svg",
        "primary_color": "#ffc400",
        "secondary_color": "#1c2536",
        "first_season": 2015,
        "last_season": 2026,
        "is_active": 1,
    },
    "FRAN_GGG": {
        "franchise_id": "FRAN_GGG",
        "display_name": "Goleta Gringos",
        "owner_id": "OWNER_GGG",
        "owner_display_name": "Kevin Sliger",
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
        "owner_display_name": "John Newton",
        "canonical_name": "San Diego Shadowcöcks",
        "current_logo_path": "/assets/logos/shadowcocks.svg",
        "primary_color": "#7928ca",
        "secondary_color": "#ff0080",
        "first_season": 2019,
        "last_season": 2026,
        "is_active": 1,
    },
    "FRAN_DCMC": {
        "franchise_id": "FRAN_DCMC",
        "display_name": "DC Mighty Cucks",
        "owner_id": "OWNER_DCMC",
        "owner_display_name": "Austin Williams",
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
        "owner_display_name": "Ryan Childress",
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
        "owner_display_name": "Levi Sanchez",
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
        "owner_display_name": "Zack Blotz",
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
        "owner_display_name": "Patrick O'Neill",
        "canonical_name": "Patagonia Pipers",
        "current_logo_path": "/assets/logos/pipers.svg",
        "primary_color": "#06b6d4",
        "secondary_color": "#ec4899",
        "first_season": 2024,
        "last_season": 2026,
        "is_active": 1,
    },
    "FRAN_HLH": {
        "franchise_id": "FRAN_HLH",
        "display_name": "Honolulu Horndogs",
        "owner_id": "OWNER_HLH",
        "owner_display_name": "Alex Clausen",
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
        "owner_display_name": "Andy Pietromonaco",
        "canonical_name": "Central Oregon Gabagooners",
        "current_logo_path": "/logos/central-oregon-gabagooners.jpg",
        "primary_color": "#ec4899",
        "secondary_color": "#f97316",
        "first_season": 2026,
        "last_season": 2026,
        "is_active": 1,
    },
    "FRAN_CVC": {
        "franchise_id": "FRAN_CVC",
        "display_name": "Chula Vista Chupacabras",
        "owner_id": "OWNER_CVC",
        "owner_display_name": "Jason Kafka",
        "canonical_name": "Chula Vista Chupacabras",
        "current_logo_path": "/logos/chula-vista-chupacabras.jpg",
        "primary_color": "#14b8a6",
        "secondary_color": "#6366f1",
        "first_season": 2016,
        "last_season": 2026,
        "is_active": 1,
    },
    # Alumni Franchises
    "FRAN_MCMD": {
        "franchise_id": "FRAN_MCMD",
        "display_name": "Muck City Mad Dawgs",
        "owner_id": "OWNER_MCMD",
        "owner_display_name": "Garrett Jones",
        "canonical_name": "Muck City Mad Dawgs",
        "current_logo_path": "/logos/muck-city-mad-dawgs.jpg",
        "primary_color": "#0284c7",
        "secondary_color": "#0ea5e9",
        "first_season": 2014,
        "last_season": 2020,
        "is_active": 0,
    },
    "FRAN_PND": {
        "franchise_id": "FRAN_PND",
        "display_name": "Pasco Pounders",
        "owner_id": "OWNER_PND",
        "owner_display_name": "Tyler Sanchez",
        "canonical_name": "Pasco Pounders",
        "current_logo_path": "/logos/pasco-pounders.png",
        "primary_color": "#64748b",
        "secondary_color": "#94a3b8",
        "first_season": 2021,
        "last_season": 2025,
        "is_active": 0,
    },
    "FRAN_PLW": {
        "franchise_id": "FRAN_PLW",
        "display_name": "Poulsbo Pollywogs",
        "owner_id": "OWNER_PLW",
        "owner_display_name": "Steven Breitmayer",
        "canonical_name": "Poulsbo Pollywogs",
        "current_logo_path": "/logos/poulsbo-pollywogs.jpg",
        "primary_color": "#22c55e",
        "secondary_color": "#15803d",
        "first_season": 2021,
        "last_season": 2025,
        "is_active": 0,
    },
    "FRAN_WSW": {
        "franchise_id": "FRAN_WSW",
        "display_name": "Winston-Salem Wake Snakes",
        "owner_id": "OWNER_WSW",
        "owner_display_name": "Tanner Dunn",
        "canonical_name": "Winston-Salem Wake Snakes",
        "current_logo_path": "/logos/winston-salem-wake-snakes.jpg",
        "primary_color": "#f97316",
        "secondary_color": "#ea580c",
        "first_season": 2017,
        "last_season": 2020,
        "is_active": 0,
    },
    "FRAN_CCB": {
        "franchise_id": "FRAN_CCB",
        "display_name": "Charleston Chewbacca",
        "owner_id": "OWNER_CCB",
        "owner_display_name": "Jake Hibbard",
        "canonical_name": "Charleston Chewbacca",
        "current_logo_path": "/logos/warlords.svg",
        "primary_color": "#9333ea",
        "secondary_color": "#7e22ce",
        "first_season": 2015,
        "last_season": 2018,
        "is_active": 0,
    },
    "FRAN_PWP": {
        "franchise_id": "FRAN_PWP",
        "display_name": "Pawtucket Patriots",
        "owner_id": "OWNER_PWP",
        "owner_display_name": "Scott Ace",
        "canonical_name": "Pawtucket Patriots",
        "current_logo_path": "/logos/pawtucket-patriots.gif",
        "primary_color": "#3b82f6",
        "secondary_color": "#1d4ed8",
        "first_season": 2014,
        "last_season": 2014,
        "is_active": 0,
    },
    "FRAN_LOB": {
        "franchise_id": "FRAN_LOB",
        "display_name": "L.O.B. Thunder",
        "owner_id": "OWNER_LOB",
        "owner_display_name": "David Allardyce",
        "canonical_name": "L.O.B. Thunder",
        "current_logo_path": "/logos/lob-thunder.jpg",
        "primary_color": "#14b8a6",
        "secondary_color": "#0f766e",
        "first_season": 2014,
        "last_season": 2014,
        "is_active": 0,
    },
}

# Accurate Member ID -> Franchise ID lookup
MEMBER_ID_FRANCHISE_MAP = {
    "{932E3951-6E1A-4EE8-AE0F-03102CC06E40}": "FRAN_SVS",  # Chris Zweifel -> Squaw Valley Skinners
    "{38023003-211E-4518-B95B-CB4801ABDD03}": "FRAN_FFC",  # Alex Renney -> Fairview Fat Cats
    "{4D1303E9-04A3-49DA-BCAC-763F18481384}": "FRAN_GGG",  # Kevin Sliger -> Goleta Gringos
    "{128B14ED-D905-4459-8410-002B423FAF2B}": "FRAN_GGG",  # Kevin Sliger (alt) -> Goleta Gringos
    "{1FCD93EE-7D57-41F4-9B12-423CCACBD834}": "FRAN_SDS",  # John Newton -> San Diego Shadowcöcks
    "{113AB975-F381-4E89-BAB9-75F3811E89C2}": "FRAN_DCMC", # Austin Williams -> DC Mighty Cucks
    "{F232E20A-A84E-45FB-97BE-BBFC3BFC10DA}": "FRAN_GTF",  # Ryan Childress -> Grand Teeton Feelers
    "{D6E8DEFF-EBCA-43DA-84CC-A5ABFF41DBBB}": "FRAN_WWL",  # Levi Sanchez -> Westeros Warlords
    "{F0757F36-16DD-4CD5-B57F-3616DDFCD5AF}": "FRAN_TJS",  # Zack Blotz -> Tijuana Sanchitos
    "{FB925176-96DC-41E0-A002-F1498CC379F0}": "FRAN_PTP",  # Patrick O'Neill -> Patagonia Pipers
    "{BF062DC5-6B65-482E-862D-C56B65B82E01}": "FRAN_HLH",  # Alex Clausen -> Honolulu Horndogs
    "{051BF68A-84EA-4930-9BF6-8A84EAF930EA}": "FRAN_CVC",  # Jason Kafka -> Chula Vista Chupacabras
    "{3A54F129-72FA-474F-92DF-172E18CAA0D1}": "FRAN_CVC",  # Jason Kafka (alt) -> Chula Vista Chupacabras
    "{98C84E35-5583-412F-8576-691E64485399}": "FRAN_MCMD", # Garrett Jones -> Muck City Mad Dawgs
    "{738EF46B-6FDF-48AF-AB54-B4DCCCE4BBDC}": "FRAN_WSW",  # Tanner Dunn -> Winston-Salem Wake Snakes
    "{F705CD26-E735-4614-9678-BFE42075A3F8}": "FRAN_WSW",  # Tanner Dunn (alt) -> Winston-Salem Wake Snakes
    "{1F90AED4-3A2C-4E1D-BB3B-6E1F292FCCC5}": "FRAN_CCB",  # Jake Hibbard -> Charleston Chewbacca
    "{64A8A21B-18B9-4D18-829F-1DD19EABF188}": "FRAN_PWP",  # Scott Ace -> Pawtucket Patriots
    "{EDC95B3D-291A-4965-895B-3D291A09656D}": "FRAN_LOB",  # David Allardyce -> L.O.B. Thunder
    "{F656FD3C-B151-4AA5-A8A3-241271BC03A8}": "FRAN_PND",  # Tyler Sanchez -> Pasco Pounders
    "{D3761649-0AE5-48C3-B616-490AE588C3DD}": "FRAN_PLW",  # Steven Breitmayer -> Poulsbo Pollywogs
}

# Alias resolution mapping for known member names / aliases to durable franchise_id
MEMBER_FRANCHISE_MAP = {
    "chris zweifel": "FRAN_SVS",
    "alex renney": "FRAN_FFC",
    "kevin sliger": "FRAN_GGG",
    "john newton": "FRAN_SDS",
    "austin williams": "FRAN_DCMC",
    "ryan childress": "FRAN_GTF",
    "levi sanchez": "FRAN_WWL",
    "zack blotz": "FRAN_TJS",
    "patrick o'neill": "FRAN_PTP",
    "alex clausen": "FRAN_HLH",
    "andy pietromonaco": "FRAN_COG",
    "jason kafka": "FRAN_CVC",
    "garrett jones": "FRAN_MCMD",
    "tanner dunn": "FRAN_WSW",
    "jake hibbard": "FRAN_CCB",
    "scott ace": "FRAN_PWP",
    "david allardyce": "FRAN_LOB",
    "tyler sanchez": "FRAN_PND",
    "steven breitmayer": "FRAN_PLW",
    
    # Historical aliases & team names
    "squaw valley skinners": "FRAN_SVS",
    "atlantic city aquasharks": "FRAN_SVS",
    "fairview fat cats": "FRAN_FFC",
    "goleta gringos": "FRAN_GGG",
    "san diego shadowcöcks": "FRAN_SDS",
    "san diego shadowcocks": "FRAN_SDS",
    "dc mighty cucks": "FRAN_DCMC",
    "cincinnati sinners": "FRAN_DCMC",
    "the dalles cowboys": "FRAN_DCMC",
    "kansas city missourians": "FRAN_DCMC",
    "grand teeton feelers": "FRAN_GTF",
    "tittsburgh feelers": "FRAN_GTF",
    "westeros warlords": "FRAN_WWL",
    "warlords of westeros": "FRAN_WWL",
    "tijuana sanchitos": "FRAN_TJS",
    "patagonia pipers": "FRAN_PTP",
    "honolulu horndogs": "FRAN_HLH",
    "central oregon gabagooners": "FRAN_COG",
    "chula vista chupacabras": "FRAN_CVC",
    "green bay glory holes": "FRAN_CVC",
    "muck city mad dawgs": "FRAN_MCMD",
    "winston-salem wake snakes": "FRAN_WSW",
    "charleston chewbacca": "FRAN_CCB",
    "pawtucket patriots": "FRAN_PWP",
    "l.o.b. thunder": "FRAN_LOB",
    "pasco pounders": "FRAN_PND",
    "poulsbo pollywogs": "FRAN_PLW",
    "poulsbo polliwogs": "FRAN_PLW",
}

def resolve_franchise_id(name_or_owner: str, default: str = None, member_id: str = None) -> str:
    if member_id and member_id in MEMBER_ID_FRANCHISE_MAP:
        return MEMBER_ID_FRANCHISE_MAP[member_id]
    if not name_or_owner:
        return default or "FRAN_UNKNOWN"
    norm = name_or_owner.strip().lower()
    for key, fid in MEMBER_FRANCHISE_MAP.items():
        if key in norm:
            return fid
    return default or "FRAN_UNKNOWN"
