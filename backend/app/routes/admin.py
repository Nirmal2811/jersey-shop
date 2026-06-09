import math
import os
import re
import uuid
from datetime import datetime, timedelta
from functools import wraps
from werkzeug.utils import secure_filename
from flask import Blueprint, request, jsonify, current_app, abort
from flask_jwt_extended import get_jwt_identity

from ..models.user import user_to_dict, hash_password
from ..models.product import product_to_dict
from ..models.order import order_to_dict, order_item_to_dict
from ..models.banner import banner_to_dict
from ..models.announcement import announcement_to_dict
from ..models.home_banner import home_banner_to_dict, DEFAULTS as BANNER_DEFAULTS
from .. import db as _db

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'bmp', 'tiff', 'tif', 'svg'}

admin_bp = Blueprint('admin', __name__)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def admin_only(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        from flask_jwt_extended import verify_jwt_in_request
        try:
            verify_jwt_in_request()
        except Exception as e:
            current_app.logger.warning(f'JWT verify failed: {type(e).__name__}: {e}')
            return jsonify({'message': 'Authorization required', 'detail': str(e)}), 401
        user_id = int(get_jwt_identity())
        user = _db.fetchone('SELECT * FROM users WHERE id = %s', (user_id,))
        if not user or not user.get('is_admin'):
            return jsonify({'message': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated


def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text


def _order_with_items(order_row):
    items = _db.fetchall('SELECT * FROM order_items WHERE order_id = %s', (order_row['id'],))
    return order_to_dict(order_row, items)


# ── Stats ──────────────────────────────────────────────────────────────────

@admin_bp.route('/stats', methods=['GET'])
@admin_only
def get_stats():
    paid_statuses = ('paid', 'processing', 'shipped', 'delivered')

    total_products = _db.scalar('SELECT COUNT(*) FROM products') or 0
    total_users = _db.scalar('SELECT COUNT(*) FROM users') or 0
    total_orders = _db.scalar('SELECT COUNT(*) FROM orders') or 0
    total_revenue = _db.scalar(
        'SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status IN %s',
        (paid_statuses,)
    ) or 0

    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_revenue = _db.scalar(
        'SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE created_at >= %s AND status IN %s',
        (thirty_days_ago, paid_statuses)
    ) or 0

    LOW = 5
    all_products = _db.fetchall('SELECT id, name, image_url, club, stock, size_stock FROM products')
    low_stock_products = []
    for p in all_products:
        alerts = []
        size_stock = p.get('size_stock') or {}
        if size_stock:
            for size, qty in size_stock.items():
                if int(qty) < LOW:
                    alerts.append({'size': size, 'qty': int(qty)})
        if not alerts and (p.get('stock') or 0) < LOW:
            alerts.append({'size': None, 'qty': p.get('stock', 0)})
        if alerts:
            low_stock_products.append({
                'id': p['id'],
                'name': p['name'],
                'image_url': p.get('image_url'),
                'club': p.get('club'),
                'stock': p.get('stock', 0),
                'alerts': alerts,
            })

    recent_orders_rows = _db.fetchall(
        'SELECT * FROM orders ORDER BY created_at DESC LIMIT 5'
    )
    recent_orders = [_order_with_items(r) for r in recent_orders_rows]

    # Chart: revenue + orders per day (last 14 days)
    fourteen_days_ago = datetime.utcnow() - timedelta(days=13)
    daily_orders = _db.fetchall(
        'SELECT * FROM orders WHERE created_at >= %s', (fourteen_days_ago,)
    )

    daily_map = {}
    for i in range(14):
        day = (datetime.utcnow() - timedelta(days=13 - i)).strftime('%d %b')
        daily_map[day] = {'date': day, 'revenue': 0, 'orders': 0}

    for o in daily_orders:
        day = o['created_at'].strftime('%d %b')
        if day in daily_map:
            daily_map[day]['orders'] += 1
            if o['status'] in paid_statuses:
                daily_map[day]['revenue'] += float(o['total_amount'])

    daily_chart = list(daily_map.values())

    status_rows = _db.fetchall(
        'SELECT status, COUNT(id) as cnt FROM orders GROUP BY status'
    )
    status_chart = [{'status': r['status'].capitalize(), 'count': r['cnt']} for r in status_rows]

    return jsonify({
        'total_products': total_products,
        'total_users': total_users,
        'total_orders': total_orders,
        'total_revenue': float(total_revenue),
        'recent_revenue': float(recent_revenue),
        'low_stock_count': len(low_stock_products),
        'low_stock_products': low_stock_products,
        'recent_orders': recent_orders,
        'daily_chart': daily_chart,
        'status_chart': status_chart,
    })


# ── Products ───────────────────────────────────────────────────────────────

@admin_bp.route('/products', methods=['GET'])
@admin_only
def list_products():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')

    if search:
        where = 'WHERE name ILIKE %s OR club ILIKE %s'
        params = [f'%{search}%', f'%{search}%']
    else:
        where, params = '', []

    total = _db.scalar(f'SELECT COUNT(*) FROM products {where}', params or None) or 0
    offset = (page - 1) * per_page
    rows = _db.fetchall(
        f'SELECT * FROM products {where} ORDER BY created_at DESC LIMIT %s OFFSET %s',
        params + [per_page, offset],
    )
    return jsonify({
        'products': [product_to_dict(r) for r in rows],
        'total': total,
        'page': page,
        'pages': math.ceil(total / per_page) if total else 0,
    })


@admin_bp.route('/products', methods=['POST'])
@admin_only
def create_product():
    data = request.get_json()
    if not data or not all(k in data for k in ('name', 'price', 'category')):
        return jsonify({'message': 'name, price and category are required'}), 400

    base_slug = slugify(data['name'])
    slug = base_slug
    counter = 1
    while _db.fetchone('SELECT id FROM products WHERE slug = %s', (slug,)):
        slug = f'{base_slug}-{counter}'
        counter += 1

    size_stock = data.get('size_stock') or {}
    stock = sum(size_stock.values()) if size_stock else int(data.get('stock', 0))

    row = _db.execute_returning(
        """INSERT INTO products
           (name, slug, description, price, original_price, category, club, gender,
            sizes, image_url, images, features, composition,
            is_new, is_bestseller, is_featured, is_on_sale,
            size_stock, stock, rating, reviews_count)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
           RETURNING *""",
        (
            data['name'].strip(), slug,
            data.get('description', ''),
            float(data['price']),
            float(data['original_price']) if data.get('original_price') else None,
            data['category'],
            data.get('club', ''),
            data.get('gender', 'men'),
            data.get('sizes', ['S', 'M', 'L', 'XL', 'XXL']),
            data.get('image_url', ''),
            data.get('images', []),
            data.get('features', []),
            data.get('composition', ''),
            bool(data.get('is_new', False)),
            bool(data.get('is_bestseller', False)),
            bool(data.get('is_featured', False)),
            bool(data.get('is_on_sale', False)),
            size_stock,
            stock,
            float(data.get('rating', 0.0)),
            int(data.get('reviews_count', 0)),
        ),
    )
    return jsonify(product_to_dict(row)), 201


@admin_bp.route('/products/<int:product_id>', methods=['PUT'])
@admin_only
def update_product(product_id):
    existing = _db.fetchone('SELECT * FROM products WHERE id = %s', (product_id,))
    if not existing:
        abort(404)
    data = request.get_json()

    # Merge incoming fields onto existing row
    def v(key, default=None):
        return data[key] if key in data else (existing.get(key) or default)

    size_stock = data.get('size_stock') or existing.get('size_stock') or {}
    if 'size_stock' in data and data['size_stock']:
        stock = sum(data['size_stock'].values())
    elif 'stock' in data:
        stock = int(data['stock'])
    else:
        stock = existing.get('stock', 0)

    slug = existing['slug']
    if 'name' in data:
        base_slug = slugify(data['name'])
        slug = base_slug
        counter = 1
        while True:
            conflict = _db.fetchone('SELECT id FROM products WHERE slug = %s', (slug,))
            if not conflict or conflict['id'] == product_id:
                break
            slug = f'{base_slug}-{counter}'
            counter += 1

    row = _db.execute_returning(
        """UPDATE products SET
           name=%s, slug=%s, description=%s, price=%s, original_price=%s,
           category=%s, club=%s, gender=%s, sizes=%s, image_url=%s, images=%s,
           features=%s, composition=%s, is_new=%s, is_bestseller=%s,
           is_featured=%s, is_on_sale=%s, size_stock=%s, stock=%s,
           rating=%s, reviews_count=%s
           WHERE id=%s RETURNING *""",
        (
            v('name'), slug, v('description', ''),
            float(v('price')),
            float(data['original_price']) if data.get('original_price') else existing.get('original_price'),
            v('category'), v('club', ''), v('gender', 'men'),
            v('sizes', ['S', 'M', 'L', 'XL', 'XXL']),
            v('image_url', ''),
            v('images', []),
            v('features', []),
            v('composition', ''),
            bool(v('is_new', False)),
            bool(v('is_bestseller', False)),
            bool(v('is_featured', False)),
            bool(v('is_on_sale', False)),
            size_stock, stock,
            float(v('rating', 0.0)),
            int(v('reviews_count', 0)),
            product_id,
        ),
    )
    return jsonify(product_to_dict(row))


@admin_bp.route('/products/<int:product_id>', methods=['DELETE'])
@admin_only
def delete_product(product_id):
    if not _db.fetchone('SELECT id FROM products WHERE id = %s', (product_id,)):
        abort(404)
    _db.execute('DELETE FROM products WHERE id = %s', (product_id,))
    return jsonify({'message': 'Product deleted'})


# ── Orders ─────────────────────────────────────────────────────────────────

@admin_bp.route('/orders', methods=['GET'])
@admin_only
def list_orders():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status', '')

    if status:
        where, params = 'WHERE status = %s', [status]
    else:
        where, params = '', []

    total = _db.scalar(f'SELECT COUNT(*) FROM orders {where}', params or None) or 0
    offset = (page - 1) * per_page
    rows = _db.fetchall(
        f'SELECT * FROM orders {where} ORDER BY created_at DESC LIMIT %s OFFSET %s',
        params + [per_page, offset],
    )

    result = []
    for o in rows:
        d = _order_with_items(o)
        user = _db.fetchone('SELECT name, email FROM users WHERE id = %s', (o.get('user_id'),)) if o.get('user_id') else None
        d['user'] = {'name': user['name'], 'email': user['email']} if user else None
        result.append(d)

    return jsonify({'orders': result, 'total': total, 'page': page,
                    'pages': math.ceil(total / per_page) if total else 0})


@admin_bp.route('/orders/<int:order_id>', methods=['PUT'])
@admin_only
def update_order(order_id):
    if not _db.fetchone('SELECT id FROM orders WHERE id = %s', (order_id,)):
        abort(404)
    data = request.get_json()
    if 'status' in data:
        valid = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']
        if data['status'] not in valid:
            return jsonify({'message': 'Invalid status'}), 400
        updated = _db.execute_returning(
            'UPDATE orders SET status=%s WHERE id=%s RETURNING *', (data['status'], order_id)
        )
        return jsonify(_order_with_items(updated))
    return jsonify({'message': 'Nothing to update'}), 400


# ── Users ──────────────────────────────────────────────────────────────────

@admin_bp.route('/users', methods=['GET'])
@admin_only
def list_users():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')

    if search:
        where = 'WHERE name ILIKE %s OR email ILIKE %s'
        params = [f'%{search}%', f'%{search}%']
    else:
        where, params = '', []

    total = _db.scalar(f'SELECT COUNT(*) FROM users {where}', params or None) or 0
    offset = (page - 1) * per_page
    rows = _db.fetchall(
        f'SELECT * FROM users {where} ORDER BY created_at DESC LIMIT %s OFFSET %s',
        params + [per_page, offset],
    )
    return jsonify({
        'users': [user_to_dict(r) for r in rows],
        'total': total,
        'page': page,
        'pages': math.ceil(total / per_page) if total else 0,
    })


@admin_bp.route('/users/<int:user_id>/toggle-admin', methods=['PUT'])
@admin_only
def toggle_admin(user_id):
    me = int(get_jwt_identity())
    if me == user_id:
        return jsonify({'message': 'Cannot change your own admin status'}), 400
    user = _db.fetchone('SELECT * FROM users WHERE id = %s', (user_id,))
    if not user:
        abort(404)
    updated = _db.execute_returning(
        'UPDATE users SET is_admin = NOT is_admin WHERE id = %s RETURNING *', (user_id,)
    )
    return jsonify(user_to_dict(updated))


# ── Image Upload ───────────────────────────────────────────────────────────

@admin_bp.route('/upload', methods=['POST'])
@admin_only
def upload_image():
    try:
        if 'file' not in request.files:
            return jsonify({'message': 'No file provided'}), 400
        file = request.files['file']
        if not file or not file.filename:
            return jsonify({'message': 'No file selected'}), 400
        if not allowed_file(file.filename):
            return jsonify({'message': 'File type not allowed'}), 400

        original = secure_filename(file.filename)
        ext = original.rsplit('.', 1)[1].lower() if '.' in original else 'jpg'
        filename = f'{uuid.uuid4().hex}.{ext}'

        upload_dir = os.path.abspath(
            os.path.join(current_app.root_path, '..', 'static', 'uploads')
        )
        os.makedirs(upload_dir, exist_ok=True)
        with open(os.path.join(upload_dir, filename), 'wb') as f:
            f.write(file.read())

        return jsonify({'url': f'/uploads/{filename}'}), 201
    except Exception as e:
        current_app.logger.error(f'Upload error: {e}', exc_info=True)
        return jsonify({'message': f'Server error: {str(e)}'}), 500


# ── Banners ────────────────────────────────────────────────────────────────

@admin_bp.route('/banners', methods=['GET'])
@admin_only
def list_banners():
    rows = _db.fetchall('SELECT * FROM banner_slides ORDER BY "order"')
    return jsonify([banner_to_dict(r) for r in rows])


@admin_bp.route('/banners', methods=['POST'])
@admin_only
def create_banner():
    data = request.get_json()
    if not data or not data.get('title'):
        return jsonify({'message': 'title is required'}), 400
    max_order = _db.scalar('SELECT COALESCE(MAX("order"), 0) FROM banner_slides') or 0
    row = _db.execute_returning(
        """INSERT INTO banner_slides
           ("order", badge, title, subtitle, image_url, bg_color, accent_color,
            cta_text, cta_link, cta_secondary_text, cta_secondary_link, is_active)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING *""",
        (
            max_order + 1,
            data.get('badge', ''),
            data['title'],
            data.get('subtitle', ''),
            data.get('image_url', ''),
            data.get('bg_color', 'from-gray-900 via-gray-800 to-black'),
            data.get('accent_color', 'bg-orange-500'),
            data.get('cta_text', 'SHOP NOW'),
            data.get('cta_link', '/products'),
            data.get('cta_secondary_text', ''),
            data.get('cta_secondary_link', '/products'),
            bool(data.get('is_active', True)),
        ),
    )
    return jsonify(banner_to_dict(row)), 201


@admin_bp.route('/banners/<int:slide_id>', methods=['PUT'])
@admin_only
def update_banner(slide_id):
    existing = _db.fetchone('SELECT * FROM banner_slides WHERE id = %s', (slide_id,))
    if not existing:
        abort(404)
    data = request.get_json()

    def v(key):
        return data[key] if key in data else existing.get(key)

    row = _db.execute_returning(
        """UPDATE banner_slides SET
           "order"=%s, badge=%s, title=%s, subtitle=%s, image_url=%s,
           bg_color=%s, accent_color=%s, cta_text=%s, cta_link=%s,
           cta_secondary_text=%s, cta_secondary_link=%s, is_active=%s
           WHERE id=%s RETURNING *""",
        (v('order'), v('badge'), v('title'), v('subtitle'), v('image_url'),
         v('bg_color'), v('accent_color'), v('cta_text'), v('cta_link'),
         v('cta_secondary_text'), v('cta_secondary_link'), v('is_active'), slide_id),
    )
    return jsonify(banner_to_dict(row))


@admin_bp.route('/banners/<int:slide_id>', methods=['DELETE'])
@admin_only
def delete_banner(slide_id):
    if not _db.fetchone('SELECT id FROM banner_slides WHERE id = %s', (slide_id,)):
        abort(404)
    _db.execute('DELETE FROM banner_slides WHERE id = %s', (slide_id,))
    return jsonify({'message': 'Slide deleted'})


# ── Announcements ──────────────────────────────────────────────────────────

@admin_bp.route('/announcements', methods=['GET'])
@admin_only
def list_announcements():
    rows = _db.fetchall('SELECT * FROM announcement_messages ORDER BY "order"')
    return jsonify([announcement_to_dict(r) for r in rows])


@admin_bp.route('/announcements', methods=['POST'])
@admin_only
def create_announcement():
    data = request.get_json()
    if not data or not data.get('message', '').strip():
        return jsonify({'message': 'message is required'}), 400
    max_order = _db.scalar('SELECT COALESCE(MAX("order"), 0) FROM announcement_messages') or 0
    row = _db.execute_returning(
        'INSERT INTO announcement_messages (message, is_active, "order") VALUES (%s,%s,%s) RETURNING *',
        (data['message'].strip(), bool(data.get('is_active', True)), max_order + 1),
    )
    return jsonify(announcement_to_dict(row)), 201


@admin_bp.route('/announcements/<int:msg_id>', methods=['PUT'])
@admin_only
def update_announcement(msg_id):
    existing = _db.fetchone('SELECT * FROM announcement_messages WHERE id = %s', (msg_id,))
    if not existing:
        abort(404)
    data = request.get_json()

    def v(key):
        return data[key] if key in data else existing.get(key)

    row = _db.execute_returning(
        'UPDATE announcement_messages SET message=%s, is_active=%s, "order"=%s WHERE id=%s RETURNING *',
        (v('message'), v('is_active'), v('order'), msg_id),
    )
    return jsonify(announcement_to_dict(row))


@admin_bp.route('/announcements/<int:msg_id>', methods=['DELETE'])
@admin_only
def delete_announcement(msg_id):
    if not _db.fetchone('SELECT id FROM announcement_messages WHERE id = %s', (msg_id,)):
        abort(404)
    _db.execute('DELETE FROM announcement_messages WHERE id = %s', (msg_id,))
    return jsonify({'message': 'Deleted'})


# ── Home Banners ───────────────────────────────────────────────────────────

@admin_bp.route('/home-banners', methods=['GET'])
@admin_only
def list_home_banners():
    result = []
    for slot in [1, 2, 3]:
        row = _db.fetchone('SELECT * FROM home_banners WHERE slot = %s', (slot,))
        result.append(home_banner_to_dict(row) if row else {'slot': slot, **BANNER_DEFAULTS[slot]})
    return jsonify(result)


@admin_bp.route('/home-banners/<int:slot>', methods=['PUT'])
@admin_only
def update_home_banner(slot):
    if slot not in [1, 2, 3]:
        return jsonify({'message': 'Invalid slot'}), 400
    data = request.get_json()
    row = _db.fetchone('SELECT * FROM home_banners WHERE slot = %s', (slot,))

    if not row:
        defaults = BANNER_DEFAULTS[slot]
        row = _db.execute_returning(
            """INSERT INTO home_banners
               (slot, type, badge, title, subtitle, cta_text, cta_link,
                cta_secondary_text, cta_secondary_link,
                image1_url, image2_url, image3_url, bg, text_dark, is_active)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING *""",
            (slot, defaults['type'], defaults['badge'], defaults['title'],
             defaults['subtitle'], defaults['cta_text'], defaults['cta_link'],
             defaults['cta_secondary_text'], defaults['cta_secondary_link'],
             defaults['image1_url'], defaults['image2_url'], defaults['image3_url'],
             defaults['bg'], defaults['text_dark'], defaults['is_active']),
        )

    def v(key):
        return data[key] if key in data else row.get(key)

    updated = _db.execute_returning(
        """UPDATE home_banners SET
           badge=%s, title=%s, subtitle=%s, cta_text=%s, cta_link=%s,
           cta_secondary_text=%s, cta_secondary_link=%s,
           image1_url=%s, image2_url=%s, image3_url=%s,
           bg=%s, text_dark=%s, is_active=%s
           WHERE slot=%s RETURNING *""",
        (v('badge'), v('title'), v('subtitle'), v('cta_text'), v('cta_link'),
         v('cta_secondary_text'), v('cta_secondary_link'),
         v('image1_url'), v('image2_url'), v('image3_url'),
         v('bg'), v('text_dark'), v('is_active'), slot),
    )
    return jsonify(home_banner_to_dict(updated))
