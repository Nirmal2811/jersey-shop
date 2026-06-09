import math
from flask import Blueprint, request, jsonify, abort
from ..models.product import product_to_dict
from .. import db as _db

products_bp = Blueprint('products', __name__)


@products_bp.route('/', methods=['GET'])
def get_products():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    category = request.args.get('category', '')
    club = request.args.get('club', '')
    gender = request.args.get('gender', '')
    sort = request.args.get('sort', 'newest')
    search = request.args.get('search', '')
    sale = request.args.get('sale', '')
    is_new = request.args.get('is_new', '')
    is_bestseller = request.args.get('is_bestseller', '')
    is_featured = request.args.get('is_featured', '')
    min_price = request.args.get('min_price', 0, type=float)
    max_price = request.args.get('max_price', 99999, type=float)

    conditions = []
    params = []

    if category:
        conditions.append('category = %s')
        params.append(category)
    if club:
        conditions.append('club ILIKE %s')
        params.append(f'%{club}%')
    if gender:
        conditions.append("(gender = %s OR gender = 'unisex')")
        params.append(gender)
    if sale == 'true':
        conditions.append('is_on_sale = TRUE')
    if is_new == 'true':
        conditions.append('is_new = TRUE')
    if is_bestseller == 'true':
        conditions.append('is_bestseller = TRUE')
    if is_featured == 'true':
        conditions.append('is_featured = TRUE')
    if search:
        conditions.append('(name ILIKE %s OR club ILIKE %s)')
        params += [f'%{search}%', f'%{search}%']
    if min_price or max_price < 99999:
        conditions.append('price >= %s AND price <= %s')
        params += [min_price, max_price]

    where = ('WHERE ' + ' AND '.join(conditions)) if conditions else ''

    order_map = {
        'price_asc': 'price ASC',
        'price_desc': 'price DESC',
        'popular': 'reviews_count DESC',
    }
    order_by = order_map.get(sort, 'created_at DESC')

    offset = (page - 1) * per_page
    total = _db.scalar(f'SELECT COUNT(*) FROM products {where}', params or None)
    rows = _db.fetchall(
        f'SELECT * FROM products {where} ORDER BY {order_by} LIMIT %s OFFSET %s',
        params + [per_page, offset],
    )

    return jsonify({
        # 'products': [product_to_dict(r) for r in rows],
        'products': [dict(r) for r in rows],
        'total': total,
        'page': page,
        'pages': math.ceil(total / per_page) if total else 0,
    })


@products_bp.route('/featured', methods=['GET'])
def get_featured():
    rows = _db.fetchall(
        'SELECT * FROM products WHERE is_featured = TRUE ORDER BY created_at DESC LIMIT 12'
    )
    return jsonify([product_to_dict(r) for r in rows])


@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    row = _db.fetchone('SELECT * FROM products WHERE id = %s', (product_id,))
    if not row:
        abort(404)
    return jsonify(product_to_dict(row))


@products_bp.route('/slug/<slug>', methods=['GET'])
def get_by_slug(slug):
    row = _db.fetchone('SELECT * FROM products WHERE slug = %s', (slug,))
    if not row:
        abort(404)
    return jsonify(product_to_dict(row))
