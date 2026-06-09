import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .config import Config
from . import db as _db

jwt = JWTManager()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, origins=app.config['CORS_ORIGINS'], supports_credentials=True)
    jwt.init_app(app)

    _db.init_pool(app.config['DATABASE_URL'])
    app.teardown_appcontext(_db.teardown)

    @jwt.unauthorized_loader
    def unauthorized_callback(reason):
        return jsonify({'message': 'Authorization required', 'reason': reason}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(reason):
        return jsonify({'message': 'Invalid token', 'reason': reason}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'message': 'Token has expired'}), 401

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({'message': 'Token has been revoked'}), 401

    from .routes import auth_bp, products_bp, cart_bp, orders_bp, payment_bp, admin_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(cart_bp, url_prefix='/api/cart')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(payment_bp, url_prefix='/api/payment')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'message': 'JerseyShop API is running'}

    @app.route('/api/banners')
    def public_banners():
        slides = _db.fetchall(
            'SELECT * FROM banner_slides WHERE is_active = TRUE ORDER BY "order"'
        )
        from .models.banner import banner_to_dict
        return jsonify([banner_to_dict(s) for s in slides])

    @app.route('/api/announcements')
    def public_announcements():
        msgs = _db.fetchall(
            'SELECT * FROM announcement_messages WHERE is_active = TRUE ORDER BY "order"'
        )
        from .models.announcement import announcement_to_dict
        return jsonify([announcement_to_dict(m) for m in msgs])

    @app.route('/api/home-banners')
    def public_home_banners():
        from .models.home_banner import home_banner_to_dict, DEFAULTS
        result = []
        for slot in [1, 2, 3]:
            row = _db.fetchone('SELECT * FROM home_banners WHERE slot = %s', (slot,))
            data = home_banner_to_dict(row) if row else DEFAULTS[slot]
            if data.get('is_active', True):
                result.append(data)
        return jsonify(result)

    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        upload_dir = os.path.join(app.root_path, '..', 'static', 'uploads')
        return send_from_directory(upload_dir, filename)

    return app
