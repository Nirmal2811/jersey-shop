def banner_to_dict(row):
    return {
        'id': row['id'],
        'order': row.get('order', 0),
        'badge': row.get('badge', ''),
        'title': row['title'],
        'subtitle': row.get('subtitle', ''),
        'image_url': row.get('image_url', ''),
        'bg_color': row.get('bg_color', 'from-gray-900 via-gray-800 to-black'),
        'accent_color': row.get('accent_color', 'bg-orange-500'),
        'cta_text': row.get('cta_text', 'SHOP NOW'),
        'cta_link': row.get('cta_link', '/products'),
        'cta_secondary_text': row.get('cta_secondary_text', ''),
        'cta_secondary_link': row.get('cta_secondary_link', '/products'),
        'is_active': row.get('is_active', True),
    }
