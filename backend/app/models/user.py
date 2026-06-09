import bcrypt


def hash_password(password):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def check_password(password, password_hash):
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def user_to_dict(row):
    return {
        'id': row['id'],
        'name': row['name'],
        'email': row['email'],
        'phone': row.get('phone'),
        'is_admin': row.get('is_admin', False),
        'created_at': row['created_at'].isoformat() if row.get('created_at') else None,
    }
