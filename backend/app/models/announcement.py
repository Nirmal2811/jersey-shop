def announcement_to_dict(row):
    return {
        'id': row['id'],
        'message': row['message'],
        'is_active': row.get('is_active', True),
        'order': row.get('order', 0),
        'created_at': row['created_at'].isoformat() if row.get('created_at') else None,
    }
