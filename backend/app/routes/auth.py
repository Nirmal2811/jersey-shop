from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from ..models.user import hash_password, check_password, user_to_dict
from .. import db as _db

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not all(k in data for k in ('name', 'email', 'password')):
        return jsonify({'message': 'Missing required fields'}), 400

    email = data['email'].lower().strip()
    if _db.fetchone('SELECT id FROM users WHERE email = %s', (email,)):
        return jsonify({'message': 'Email already registered'}), 409

    pw_hash = hash_password(data['password'])
    user = _db.execute_returning(
        'INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s) RETURNING *',
        (data['name'].strip(), email, pw_hash),
    )
    token = create_access_token(identity=str(user['id']))
    return jsonify({'access_token': token, 'user': user_to_dict(user)}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not all(k in data for k in ('email', 'password')):
        return jsonify({'message': 'Missing email or password'}), 400

    email = data['email'].lower().strip()
    user = _db.fetchone('SELECT * FROM users WHERE email = %s', (email,))
    if not user or not check_password(data['password'], user['password_hash']):
        return jsonify({'message': 'Invalid email or password'}), 401

    token = create_access_token(identity=str(user['id']))
    return jsonify({'access_token': token, 'user': user_to_dict(user)})


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    user_id = int(get_jwt_identity())
    user = _db.fetchone('SELECT * FROM users WHERE id = %s', (user_id,))
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify(user_to_dict(user))


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = _db.fetchone('SELECT * FROM users WHERE id = %s', (user_id,))
    if not user:
        return jsonify({'message': 'User not found'}), 404

    data = request.get_json()
    name = data.get('name', user['name']).strip()
    phone = data.get('phone', user['phone'])
    pw_hash = hash_password(data['password']) if data.get('password') else user['password_hash']

    updated = _db.execute_returning(
        'UPDATE users SET name=%s, phone=%s, password_hash=%s WHERE id=%s RETURNING *',
        (name, phone, pw_hash, user_id),
    )
    return jsonify(user_to_dict(updated))
