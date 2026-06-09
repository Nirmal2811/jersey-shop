"""One-time script to deduct stock for existing orders."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app
from app.db import fetchall, execute

app = create_app()
with app.app_context():
    items = fetchall("""
        SELECT oi.product_id, oi.size, oi.quantity, p.size_stock, p.stock
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        JOIN orders o ON o.id = oi.order_id
        WHERE o.status NOT IN ('cancelled')
    """)
    print(f"Reconciling {len(items)} order items...")
    for item in items:
        pid   = item['product_id']
        size  = item['size']
        qty   = item['quantity']
        ss    = item['size_stock'] or {}
        stock = item['stock'] or 0

        if size and size in ss:
            ss[size] = max(0, int(ss[size]) - qty)
            new_stock = sum(int(v) for v in ss.values())
            execute('UPDATE products SET size_stock=%s, stock=%s WHERE id=%s', (ss, new_stock, pid))
            print(f'  Product {pid} size {size}: -{qty} -> {ss[size]} left')
        else:
            new_stock = max(0, stock - qty)
            execute('UPDATE products SET stock=%s WHERE id=%s', (new_stock, pid))
            print(f'  Product {pid}: stock {stock} -> {new_stock}')

    print('Done.')
