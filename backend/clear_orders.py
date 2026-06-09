"""Removes all orders, restores product stock, resets sequences to 1."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app
from app.db import fetchall, execute

app = create_app()
with app.app_context():
    # Restore stock deducted by non-cancelled orders
    items = fetchall("""
        SELECT oi.product_id, oi.size, oi.quantity, p.size_stock, p.stock
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        JOIN orders o ON o.id = oi.order_id
        WHERE o.status NOT IN ('cancelled')
    """)
    for item in items:
        pid  = item['product_id']
        size = item['size']
        qty  = item['quantity']
        ss   = item['size_stock'] or {}
        if size and size in ss:
            ss[size] = int(ss[size]) + qty
            execute('UPDATE products SET size_stock=%s, stock=%s WHERE id=%s',
                    (ss, sum(int(v) for v in ss.values()), pid))
        else:
            execute('UPDATE products SET stock = stock + %s WHERE id=%s', (qty, pid))
    print(f'Restored stock for {len(items)} order item(s).')

    # Clear orders and reset sequences
    execute('TRUNCATE TABLE order_items, orders RESTART IDENTITY CASCADE')
    print('All orders deleted. Sequences reset to 1.')
