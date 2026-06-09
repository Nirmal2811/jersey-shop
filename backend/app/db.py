import psycopg2
import psycopg2.pool
import psycopg2.extras
import psycopg2.extensions
from flask import g


_pool = None
_dsn = None
_minconn = 2
_maxconn = 10


def init_pool(dsn, minconn=2, maxconn=10):
    global _dsn, _minconn, _maxconn
    psycopg2.extensions.register_adapter(dict, psycopg2.extras.Json)
    psycopg2.extensions.register_adapter(list, psycopg2.extras.Json)
    _dsn = dsn
    _minconn = minconn
    _maxconn = maxconn


def _get_pool():
    global _pool
    if _pool is None:
        _pool = psycopg2.pool.ThreadedConnectionPool(_minconn, _maxconn, _dsn)
    return _pool


def get_conn():
    if 'pg_conn' not in g:
        g.pg_conn = _get_pool().getconn()
    return g.pg_conn


def teardown(e=None):
    conn = g.pop('pg_conn', None)
    if conn is not None:
        if not conn.closed:
            try:
                conn.rollback()
            except Exception:
                pass
        _pool.putconn(conn)


def _cur(conn):
    return conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)


def fetchall(sql, params=None):
    conn = get_conn()
    with _cur(conn) as cur:
        cur.execute(sql, params)
        rows = cur.fetchall()
    conn.commit()
    return [dict(r) for r in rows]


def fetchone(sql, params=None):
    conn = get_conn()
    with _cur(conn) as cur:
        cur.execute(sql, params)
        row = cur.fetchone()
    conn.commit()
    return dict(row) if row else None


def execute(sql, params=None):
    conn = get_conn()
    with conn.cursor() as cur:
        cur.execute(sql, params)
    conn.commit()


def execute_returning(sql, params=None):
    conn = get_conn()
    with _cur(conn) as cur:
        cur.execute(sql, params)
        row = cur.fetchone()
    conn.commit()
    return dict(row) if row else None


def scalar(sql, params=None):
    conn = get_conn()
    with conn.cursor() as cur:
        cur.execute(sql, params)
        row = cur.fetchone()
    conn.commit()
    return row[0] if row else None


def create_tables():
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id          SERIAL PRIMARY KEY,
            name        VARCHAR(120) NOT NULL,
            email       VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            phone       VARCHAR(20),
            is_admin    BOOLEAN DEFAULT FALSE,
            created_at  TIMESTAMP DEFAULT NOW()
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id             SERIAL PRIMARY KEY,
            name           VARCHAR(255) NOT NULL,
            slug           VARCHAR(255) UNIQUE NOT NULL,
            description    TEXT,
            price          NUMERIC(10,2) NOT NULL,
            original_price NUMERIC(10,2),
            category       VARCHAR(100) NOT NULL,
            club           VARCHAR(100),
            gender         VARCHAR(20) DEFAULT 'men',
            sizes          JSONB DEFAULT '[]',
            image_url      VARCHAR(500),
            images         JSONB DEFAULT '[]',
            features       JSONB DEFAULT '[]',
            composition    VARCHAR(255),
            is_new         BOOLEAN DEFAULT FALSE,
            is_bestseller  BOOLEAN DEFAULT FALSE,
            is_featured    BOOLEAN DEFAULT FALSE,
            is_on_sale     BOOLEAN DEFAULT FALSE,
            stock          INTEGER DEFAULT 100,
            size_stock     JSONB DEFAULT '{}',
            rating         FLOAT DEFAULT 0.0,
            reviews_count  INTEGER DEFAULT 0,
            created_at     TIMESTAMP DEFAULT NOW()
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id                   SERIAL PRIMARY KEY,
            user_id              INTEGER REFERENCES users(id),
            razorpay_order_id    VARCHAR(100),
            razorpay_payment_id  VARCHAR(100),
            status               VARCHAR(30) DEFAULT 'processing',
            total_amount         NUMERIC(10,2) NOT NULL,
            shipping_amount      NUMERIC(10,2) DEFAULT 0,
            delivery_name        VARCHAR(120),
            delivery_email       VARCHAR(255),
            delivery_phone       VARCHAR(20),
            delivery_address     TEXT,
            delivery_city        VARCHAR(100),
            delivery_state       VARCHAR(100),
            delivery_pincode     VARCHAR(20),
            created_at           TIMESTAMP DEFAULT NOW()
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS order_items (
            id            SERIAL PRIMARY KEY,
            order_id      INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            product_id    INTEGER REFERENCES products(id),
            product_name  VARCHAR(255),
            product_image VARCHAR(500),
            size          VARCHAR(10),
            quantity      INTEGER NOT NULL,
            unit_price    NUMERIC(10,2) NOT NULL
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS banner_slides (
            id                  SERIAL PRIMARY KEY,
            "order"             INTEGER DEFAULT 0,
            badge               VARCHAR(100) DEFAULT '',
            title               VARCHAR(200) NOT NULL,
            subtitle            VARCHAR(300) DEFAULT '',
            image_url           VARCHAR(500) DEFAULT '',
            bg_color            VARCHAR(50) DEFAULT 'from-gray-900 via-gray-800 to-black',
            accent_color        VARCHAR(50) DEFAULT 'bg-orange-500',
            cta_text            VARCHAR(100) DEFAULT 'SHOP NOW',
            cta_link            VARCHAR(200) DEFAULT '/products',
            cta_secondary_text  VARCHAR(100) DEFAULT '',
            cta_secondary_link  VARCHAR(200) DEFAULT '/products',
            is_active           BOOLEAN DEFAULT TRUE
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS home_banners (
            id                  SERIAL PRIMARY KEY,
            slot                INTEGER UNIQUE NOT NULL,
            type                VARCHAR(20) NOT NULL,
            badge               VARCHAR(100) DEFAULT '',
            title               VARCHAR(200) DEFAULT '',
            subtitle            VARCHAR(300) DEFAULT '',
            cta_text            VARCHAR(100) DEFAULT 'SHOP NOW',
            cta_link            VARCHAR(200) DEFAULT '/products',
            cta_secondary_text  VARCHAR(100) DEFAULT '',
            cta_secondary_link  VARCHAR(200) DEFAULT '/products',
            image1_url          VARCHAR(500) DEFAULT '',
            image2_url          VARCHAR(500) DEFAULT '',
            image3_url          VARCHAR(500) DEFAULT '',
            bg                  VARCHAR(100) DEFAULT '#f5f5f5',
            text_dark           BOOLEAN DEFAULT TRUE,
            is_active           BOOLEAN DEFAULT TRUE
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS announcement_messages (
            id         SERIAL PRIMARY KEY,
            message    VARCHAR(300) NOT NULL,
            is_active  BOOLEAN NOT NULL DEFAULT TRUE,
            "order"    INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)

    conn.commit()
    cur.close()
