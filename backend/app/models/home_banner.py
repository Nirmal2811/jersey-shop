DEFAULTS = {
    1: {
        'slot': 1, 'type': 'split', 'badge': '2026/27 SEASON',
        'title': 'MADE FOR CHAMPIONS',
        'subtitle': 'Official Club Jerseys · Real Madrid · Barcelona · Man United · Liverpool',
        'cta_text': 'SHOP CLUB KITS', 'cta_link': '/products?category=club-jersey',
        'cta_secondary_text': 'NEW ARRIVALS', 'cta_secondary_link': '/products?sort=newest',
        'image1_url': '/images/Club.png', 'image2_url': '/images/Club2.png', 'image3_url': '',
        'bg': '#f5f5f5', 'text_dark': True, 'is_active': True,
    },
    2: {
        'slot': 2, 'type': 'fullwidth', 'badge': 'FIFA WORLD CUP 2026',
        'title': 'WEAR YOUR PRIDE',
        'subtitle': 'Argentina · Brazil · France · Portugal · Germany',
        'cta_text': 'SHOP NATIONAL KITS', 'cta_link': '/products?category=national-team',
        'cta_secondary_text': '', 'cta_secondary_link': '/products',
        'image1_url': '/images/Banner2.png', 'image2_url': '', 'image3_url': '',
        'bg': 'bg-gray-100', 'text_dark': True, 'is_active': True,
    },
    3: {
        'slot': 3, 'type': 'threepanel', 'badge': 'TRAINING COLLECTION',
        'title': 'TRAIN LIKE A PRO',
        'subtitle': 'Club & National Team Training Jackets',
        'cta_text': 'SHOP NOW', 'cta_link': '/products?category=jacket',
        'cta_secondary_text': '', 'cta_secondary_link': '/products',
        'image1_url': '/images/Banner3.1.png', 'image2_url': '/images/Banner3.2.2.png',
        'image3_url': '/images/Banner3.3.png', 'bg': '', 'text_dark': False, 'is_active': True,
    },
}


def home_banner_to_dict(row):
    return {
        'id': row.get('id'),
        'slot': row['slot'],
        'type': row['type'],
        'badge': row.get('badge', ''),
        'title': row.get('title', ''),
        'subtitle': row.get('subtitle', ''),
        'cta_text': row.get('cta_text', 'SHOP NOW'),
        'cta_link': row.get('cta_link', '/products'),
        'cta_secondary_text': row.get('cta_secondary_text', ''),
        'cta_secondary_link': row.get('cta_secondary_link', '/products'),
        'image1_url': row.get('image1_url', ''),
        'image2_url': row.get('image2_url', ''),
        'image3_url': row.get('image3_url', ''),
        'bg': row.get('bg', '#f5f5f5'),
        'text_dark': row.get('text_dark', True),
        'is_active': row.get('is_active', True),
    }
