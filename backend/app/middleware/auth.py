from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from ..db import fetchone


def jwt_required_custom(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            return fn(*args, **kwargs)
        except Exception:
            return jsonify({'message': 'Authentication required'}), 401
    return wrapper


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = int(get_jwt_identity())
            user = fetchone('SELECT is_admin FROM users WHERE id = %s', (user_id,))
            if not user or not user.get('is_admin'):
                return jsonify({'message': 'Admin access required'}), 403
            return fn(*args, **kwargs)
        except Exception:
            return jsonify({'message': 'Authentication required'}), 401
    return wrapper
