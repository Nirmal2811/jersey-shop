from flask import Blueprint, request, jsonify
from .. import db as _db

cart_bp = Blueprint('cart', __name__)


@cart_bp.route('/validate', methods=['POST'])
def validate_cart():
    items = request.get_json().get('items', [])
    validated = []
    for item in items:
        pid = item.get('product_id')
        row = _db.fetchone('SELECT * FROM products WHERE id = %s', (pid,))
        if row and row.get('stock', 0) > 0:
            validated.append({
                'product_id': row['id'],
                'name': row['name'],
                'price': float(row['price']),
                'size': item.get('size'),
                'quantity': min(item.get('quantity', 1), row['stock']),
                'image_url': row.get('image_url'),
                'available': True,
            })
        else:
            validated.append({'product_id': pid, 'available': False})
    return jsonify({'items': validated})
