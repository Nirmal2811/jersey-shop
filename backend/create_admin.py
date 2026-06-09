"""Creates the admin user without touching existing products or orders.
Run from the backend directory: python create_admin.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app
from app.db import create_tables, fetchone, execute, execute_returning
from app.models.user import hash_password

EMAIL = 'admin@jerseyshop.com'
PASSWORD = 'admin123'

app = create_app()
with app.app_context():
    create_tables()
    existing = fetchone('SELECT * FROM users WHERE email = %s', (EMAIL,))
    if existing:
        execute(
            'UPDATE users SET is_admin = TRUE, password_hash = %s WHERE email = %s',
            (hash_password(PASSWORD), EMAIL),
        )
        print(f'[OK] Updated existing user {EMAIL} -> is_admin=True')
    else:
        execute(
            'INSERT INTO users (name, email, password_hash, is_admin) VALUES (%s,%s,%s,%s)',
            ('Admin', EMAIL, hash_password(PASSWORD), True),
        )
        print(f'[OK] Created admin user: {EMAIL} / {PASSWORD}')
