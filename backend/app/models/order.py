def order_item_to_dict(row):
    return {
        'id': row['id'],
        'product_id': row.get('product_id'),
        'product_name': row.get('product_name'),
        'product_image': row.get('product_image'),
        'size': row.get('size'),
        'quantity': row['quantity'],
        'unit_price': float(row['unit_price']),
        'subtotal': float(row['unit_price']) * row['quantity'],
    }


def order_to_dict(row, items_rows):
    return {
        'id': row['id'],
        'razorpay_order_id': row.get('razorpay_order_id'),
        'razorpay_payment_id': row.get('razorpay_payment_id'),
        'status': row['status'],
        'total_amount': float(row['total_amount']),
        'shipping_amount': float(row['shipping_amount']),
        'delivery': {
            'name': row.get('delivery_name'),
            'email': row.get('delivery_email'),
            'phone': row.get('delivery_phone'),
            'address': row.get('delivery_address'),
            'city': row.get('delivery_city'),
            'state': row.get('delivery_state'),
            'pincode': row.get('delivery_pincode'),
        },
        'items': [order_item_to_dict(i) for i in items_rows],
        'created_at': row['created_at'].isoformat() if row.get('created_at') else None,
    }
