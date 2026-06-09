from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.order import order_to_dict
from .. import db as _db

orders_bp = Blueprint('orders', __name__)


def _order_with_items(order_row):
    items = _db.fetchall('SELECT * FROM order_items WHERE order_id = %s', (order_row['id'],))
    return order_to_dict(order_row, items)


@orders_bp.route('/', methods=['GET'])
@jwt_required()
def get_orders():
    user_id = int(get_jwt_identity())
    rows = _db.fetchall(
        'SELECT * FROM orders WHERE user_id = %s ORDER BY created_at DESC', (user_id,)
    )
    return jsonify([_order_with_items(r) for r in rows])


@orders_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    user_id = int(get_jwt_identity())
    row = _db.fetchone(
        'SELECT * FROM orders WHERE id = %s AND user_id = %s', (order_id, user_id)
    )
    if not row:
        abort(404)
    return jsonify(_order_with_items(row))


@orders_bp.route('/<int:order_id>/cancel', methods=['PUT'])
@jwt_required()
def cancel_order(order_id):
    user_id = int(get_jwt_identity())
    row = _db.fetchone(
        'SELECT * FROM orders WHERE id = %s AND user_id = %s', (order_id, user_id)
    )
    if not row:
        abort(404)
    if row['status'] != 'processing':
        return jsonify({'message': 'Order cannot be cancelled at this stage'}), 400

    # Restore stock for each item
    items = _db.fetchall('SELECT * FROM order_items WHERE order_id = %s', (order_id,))
    for item in items:
        pid  = item['product_id']
        size = item['size']
        qty  = item['quantity']
        product = _db.fetchone('SELECT stock, size_stock FROM products WHERE id = %s', (pid,))
        if not product:
            continue
        ss = product.get('size_stock') or {}
        if size and size in ss:
            ss[size] = int(ss[size]) + qty
            _db.execute(
                'UPDATE products SET size_stock=%s, stock=%s WHERE id=%s',
                (ss, sum(int(v) for v in ss.values()), pid),
            )
        else:
            _db.execute(
                'UPDATE products SET stock = stock + %s WHERE id=%s', (qty, pid)
            )

    updated = _db.execute_returning(
        "UPDATE orders SET status = 'cancelled' WHERE id = %s RETURNING *", (order_id,)
    )
    return jsonify(_order_with_items(updated))
