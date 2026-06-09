import razorpay
import hmac
import hashlib
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from ..models.order import order_to_dict
from .. import db as _db

payment_bp = Blueprint('payment', __name__)


def _get_razorpay():
    return razorpay.Client(
        auth=(current_app.config['RAZORPAY_KEY_ID'], current_app.config['RAZORPAY_KEY_SECRET'])
    )


def _get_optional_user():
    try:
        verify_jwt_in_request(optional=True)
        uid = get_jwt_identity()
        return int(uid) if uid else None
    except Exception:
        return None


def _build_order(user_id, delivery, items_data, razorpay_order_id=None,
                 razorpay_payment_id=None, cod=False):
    total = 0
    line_items = []
    for item in items_data:
        row = _db.fetchone('SELECT * FROM products WHERE id = %s', (item.get('product_id'),))
        if row:
            qty = item.get('quantity', 1)
            total += float(row['price']) * qty
            line_items.append({
                'product_id': row['id'],
                'product_name': row['name'],
                'product_image': row.get('image_url'),
                'size': item.get('size'),
                'quantity': qty,
                'unit_price': float(row['price']),
            })

    shipping = 99
    gst = round(total * 0.18)
    cod_fee = 50 if cod else 0
    grand_total = total + shipping + gst + cod_fee

    order = _db.execute_returning(
        """INSERT INTO orders
           (user_id, razorpay_order_id, razorpay_payment_id, status,
            total_amount, shipping_amount,
            delivery_name, delivery_email, delivery_phone,
            delivery_address, delivery_city, delivery_state, delivery_pincode)
           VALUES (%s,%s,%s,'processing',%s,%s,%s,%s,%s,%s,%s,%s,%s)
           RETURNING *""",
        (user_id, razorpay_order_id, razorpay_payment_id,
         grand_total, shipping,
         delivery.get('name'), delivery.get('email'), delivery.get('phone'),
         delivery.get('address'), delivery.get('city'),
         delivery.get('state'), delivery.get('pincode')),
    )

    for li in line_items:
        _db.execute(
            """INSERT INTO order_items
               (order_id, product_id, product_name, product_image, size, quantity, unit_price)
               VALUES (%s,%s,%s,%s,%s,%s,%s)""",
            (order['id'], li['product_id'], li['product_name'], li['product_image'],
             li['size'], li['quantity'], li['unit_price']),
        )
        # Deduct stock
        product = _db.fetchone(
            'SELECT stock, size_stock FROM products WHERE id = %s', (li['product_id'],)
        )
        if product:
            size_stock = product.get('size_stock') or {}
            size = li['size']
            qty  = li['quantity']
            if size and size in size_stock:
                size_stock[size] = max(0, int(size_stock[size]) - qty)
                new_stock = sum(int(v) for v in size_stock.values())
                _db.execute(
                    'UPDATE products SET size_stock = %s, stock = %s WHERE id = %s',
                    (size_stock, new_stock, li['product_id']),
                )
            else:
                new_stock = max(0, int(product.get('stock') or 0) - qty)
                _db.execute(
                    'UPDATE products SET stock = %s WHERE id = %s',
                    (new_stock, li['product_id']),
                )

    items = _db.fetchall('SELECT * FROM order_items WHERE order_id = %s', (order['id'],))
    return order, items


@payment_bp.route('/create-order', methods=['POST'])
def create_order():
    data = request.get_json()
    amount = int(data.get('amount', 0) * 100)
    if amount <= 0:
        return jsonify({'message': 'Invalid amount'}), 400
    try:
        client = _get_razorpay()
        rp_order = client.order.create({'amount': amount, 'currency': 'INR', 'payment_capture': 1})
        return jsonify({'order_id': rp_order['id'], 'amount': amount, 'currency': 'INR'})
    except Exception as e:
        return jsonify({'message': f'Failed to create order: {str(e)}'}), 500


@payment_bp.route('/cod-order', methods=['POST'])
def cod_order():
    data = request.get_json()
    user_id = _get_optional_user()
    order, items = _build_order(
        user_id=user_id,
        delivery=data.get('delivery', {}),
        items_data=data.get('items', []),
        cod=True,
    )
    return jsonify({'message': 'Order placed', 'order_id': order['id']}), 201


@payment_bp.route('/verify', methods=['POST'])
def verify_payment():
    data = request.get_json()
    rp_order_id = data.get('razorpay_order_id', '')
    rp_payment_id = data.get('razorpay_payment_id', '')
    rp_signature = data.get('razorpay_signature', '')

    try:
        key_secret = current_app.config['RAZORPAY_KEY_SECRET'].encode()
        body = f'{rp_order_id}|{rp_payment_id}'.encode()
        expected = hmac.new(key_secret, body, hashlib.sha256).hexdigest()
        if expected != rp_signature:
            return jsonify({'message': 'Invalid payment signature'}), 400
    except Exception:
        pass  # demo mode

    user_id = _get_optional_user()
    order, items = _build_order(
        user_id=user_id,
        delivery=data.get('delivery', {}),
        items_data=data.get('items', []),
        razorpay_order_id=rp_order_id,
        razorpay_payment_id=rp_payment_id,
    )
    return jsonify({'message': 'Payment verified', 'order_id': order['id']})
