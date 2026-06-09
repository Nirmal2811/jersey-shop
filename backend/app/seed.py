"""Run with: python -m app.seed  (from backend/ directory)"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import create_app
from app.db import create_tables, fetchone, execute, execute_returning
from app.models.user import hash_password

SIZES_JERSEY = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
SIZES_JACKET = ['S', 'M', 'L', 'XL', 'XXL']

PRODUCTS = [
    dict(name='Real Madrid Home Jersey 2024/25', slug='real-madrid-home-2425', club='Real Madrid', category='club-jersey', gender='men', price=4999, original_price=5999, image_url='https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop', sizes=SIZES_JERSEY, is_new=True, is_featured=True, is_on_sale=True, rating=4.8, reviews_count=245, description='Official Real Madrid Home Jersey for 2024/25 season with advanced Dri-FIT ADV technology.', features=['Dri-FIT ADV technology', 'Recycled polyester fabric', 'Heat-transfer club crest'], composition='100% Recycled Polyester', stock=200),
    dict(name='Real Madrid Away Jersey 2024/25', slug='real-madrid-away-2425', club='Real Madrid', category='club-jersey', gender='men', price=4999, original_price=None, image_url='https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&auto=format&fit=crop', sizes=SIZES_JERSEY, is_new=True, is_featured=False, rating=4.6, reviews_count=98, description='Official Real Madrid Away Jersey 2024/25. Sleek design for away fixtures.', features=['Dri-FIT technology', 'Recycled polyester', 'Standard fit'], composition='100% Recycled Polyester', stock=150),
    dict(name='FC Barcelona Home Jersey 2024/25', slug='barcelona-home-2425', club='FC Barcelona', category='club-jersey', gender='men', price=4999, original_price=None, image_url='https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop', sizes=SIZES_JERSEY, is_new=True, is_featured=True, is_bestseller=True, rating=4.9, reviews_count=312, description='Official FC Barcelona Home Jersey 2024/25. The iconic blaugrana stripes reimagined.', features=['ClimaCool technology', 'Embroidered club badge', 'Slim fit'], composition='100% Recycled Polyester', stock=180),
    dict(name='Manchester United Home Jersey 2024/25', slug='man-united-home-2425', club='Manchester United', category='club-jersey', gender='men', price=4599, original_price=None, image_url='https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800&auto=format&fit=crop', sizes=SIZES_JERSEY, is_new=False, is_featured=True, rating=4.6, reviews_count=178, description='Official Manchester United Home Jersey. Iconic red for Old Trafford.', features=['AeroReact technology', 'Club badge embroidery', 'Regular fit'], composition='100% Recycled Polyester', stock=200),
    dict(name='Manchester City Home Jersey 2024/25', slug='man-city-home-2425', club='Manchester City', category='club-jersey', gender='men', price=4599, original_price=None, image_url='https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=800&auto=format&fit=crop', sizes=SIZES_JERSEY, is_new=False, is_featured=True, is_bestseller=True, rating=4.8, reviews_count=198, description='Official Manchester City Home Jersey 2024/25. Sky blue for the champions.', features=['Dri-FIT technology', 'Regular fit', 'Badge embroidery'], composition='100% Recycled Polyester', stock=160),
    dict(name='Liverpool FC Home Jersey 2024/25', slug='liverpool-home-2425', club='Liverpool FC', category='club-jersey', gender='men', price=4599, original_price=5499, image_url='https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&auto=format&fit=crop', sizes=SIZES_JERSEY, is_new=False, is_featured=True, is_on_sale=True, rating=4.7, reviews_count=234, description="Official Liverpool FC Home Jersey. You'll never walk alone in this kit.", features=['AeroReact technology', 'Standard fit', 'LFC crest embroidery'], composition='100% Recycled Polyester', stock=190),
    dict(name='Chelsea FC Home Jersey 2024/25', slug='chelsea-home-2425', club='Chelsea FC', category='club-jersey', gender='men', price=4599, original_price=5499, image_url='https://images.unsplash.com/photo-1529516548873-9ce57c8f155e?w=800&auto=format&fit=crop', sizes=SIZES_JERSEY, is_on_sale=True, rating=4.5, reviews_count=156, description='Official Chelsea FC Home Jersey. Royal blue for the Blues.', features=['ClimaCool ventilation', 'Regular fit', 'Badge woven detail'], composition='100% Recycled Polyester', stock=140),
    dict(name='Arsenal FC Home Jersey 2024/25', slug='arsenal-home-2425', club='Arsenal FC', category='club-jersey', gender='men', price=4599, original_price=None, image_url='https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop', sizes=SIZES_JERSEY, is_new=True, rating=4.7, reviews_count=187, description='Official Arsenal FC Home Jersey. The cannon shirt for Gooners worldwide.', features=['Dri-FIT technology', 'Regular fit', 'Cannon badge embroidery'], composition='100% Recycled Polyester', stock=170),
    dict(name='Bayern Munich Home Jersey 2024/25', slug='bayern-home-2425', club='Bayern Munich', category='club-jersey', gender='men', price=5499, original_price=None, image_url='https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800&auto=format&fit=crop', sizes=SIZES_JERSEY, is_featured=True, rating=4.6, reviews_count=142, description='Official FC Bayern München Home Jersey 2024/25. Red is never more dominant.', features=['TechFit technology', 'Slim fit', 'Embroidered crest'], composition='100% Recycled Polyester', stock=130),
    dict(name='Paris Saint-Germain Home Jersey 2024/25', slug='psg-home-2425', club='PSG', category='club-jersey', gender='men', price=5499, original_price=6499, image_url='https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800&auto=format&fit=crop', sizes=SIZES_JERSEY, is_new=True, is_featured=True, is_on_sale=True, rating=4.5, reviews_count=201, description='Official Paris Saint-Germain Home Jersey. Parisian elegance meets football performance.', features=['AeroReact technology', 'Regular fit', 'Eiffel Tower graphic detail'], composition='100% Recycled Polyester', stock=120),
    dict(name='Juventus Home Jersey 2024/25', slug='juventus-home-2425', club='Juventus', category='club-jersey', gender='men', price=4999, original_price=None, image_url='https://images.unsplash.com/photo-1540747913346-19212a4b32d6?w=800&auto=format&fit=crop', sizes=SIZES_JERSEY, rating=4.6, reviews_count=119, description='Official Juventus Home Jersey 2024/25. Black and white for the Old Lady.', features=['Dri-FIT technology', 'Regular fit', 'Juventus star badge'], composition='100% Recycled Polyester', stock=100),
    dict(name='BVB Borussia Dortmund Home Jersey 2024/25', slug='bvb-home-2425', club='BVB', category='club-jersey', gender='men', price=4999, original_price=None, image_url='https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&auto=format&fit=crop', sizes=SIZES_JERSEY, is_new=True, rating=4.5, reviews_count=89, description='Official Borussia Dortmund Home Jersey. Yellow and black for die Schwarzgelben.', features=['AeroReact technology', 'Regular fit', 'BVB badge embroidery'], composition='100% Recycled Polyester', stock=90),
    dict(name='Brazil Home Jersey Copa America 2024', slug='brazil-home-copa24', club='Brazil NT', category='national-team', gender='men', price=5999, original_price=7499, image_url='https://images.unsplash.com/photo-1552318965-6e6be7484ada?w=800&auto=format&fit=crop', sizes=SIZES_JERSEY, is_featured=True, is_bestseller=True, is_on_sale=True, rating=4.7, reviews_count=189, description='The iconic Canarinho jersey worn by Brazil at Copa America 2024.', features=['HEAT.RDY technology', 'CBF crest embroidery', 'Standard fit'], composition='100% Recycled Polyester', stock=220),
    dict(name='Argentina Home Jersey 2024', slug='argentina-home-2024', club='Argentina NT', category='national-team', gender='men', price=5999, original_price=None, image_url='https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=800&auto=format&fit=crop', sizes=SIZES_JERSEY, is_featured=True, is_bestseller=True, rating=4.9, reviews_count=421, description='Official World Champion Argentina Home Jersey. Light blue and white stripes of the Albiceleste.', features=['AFA Official licensed', 'ClimaCool ventilation', 'Standard fit'], composition='100% Recycled Polyester', stock=250),
    dict(name='France Home Jersey Euro 2024', slug='france-home-euro24', club='France NT', category='national-team', gender='men', price=5499, original_price=None, image_url='https://images.unsplash.com/photo-1561134643-668f9057cce4?w=800&auto=format&fit=crop', sizes=SIZES_JERSEY, is_new=True, is_featured=True, rating=4.8, reviews_count=167, description='Official France Home Jersey for Euro 2024. Les Bleus in dark navy blue.', features=['Dri-FIT ADV technology', 'FFF crest embroidery', 'Slim fit'], composition='100% Recycled Polyester', stock=180),
    dict(name='Germany Home Jersey Euro 2024', slug='germany-home-euro24', club='Germany NT', category='national-team', gender='men', price=4999, original_price=None, image_url='https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&auto=format&fit=crop', sizes=SIZES_JERSEY, is_new=True, rating=4.7, reviews_count=134, description='Official Germany National Team Home Jersey for Euro 2024. Die Mannschaft classic white.', features=['ClimaCool technology', 'DFB badge embroidery', 'Regular fit'], composition='100% Recycled Polyester', stock=140),
    dict(name='Portugal Home Jersey Euro 2024', slug='portugal-home-euro24', club='Portugal NT', category='national-team', gender='men', price=5499, original_price=None, image_url='https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&auto=format&fit=crop', sizes=SIZES_JERSEY, is_new=True, rating=4.8, reviews_count=203, description='Official Portugal Home Jersey for Euro 2024. Red and green for A Seleção.', features=['Dri-FIT technology', 'FPF crest embroidery', 'Standard fit'], composition='100% Recycled Polyester', stock=160),
    dict(name='Real Madrid Training Jacket 2024/25', slug='real-madrid-training-jacket', club='Real Madrid', category='jacket', gender='men', price=6999, original_price=8999, image_url='https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop', sizes=SIZES_JACKET, is_new=True, is_featured=True, is_on_sale=True, rating=4.5, reviews_count=98, description='Official Real Madrid Training Jacket. Stay warm during pre-match warm-ups.', features=['Therma-FIT technology', 'Full zip', 'Kangaroo pockets', 'Club badge'], composition='100% Polyester', stock=80),
    dict(name='FC Barcelona Training Jacket 2024/25', slug='barcelona-training-jacket', club='FC Barcelona', category='jacket', gender='men', price=6999, original_price=None, image_url='https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop', sizes=SIZES_JACKET, rating=4.4, reviews_count=76, description='Official FC Barcelona Training Jacket. Blaugrana training gear for champions.', features=['Dri-FIT technology', 'Full zip', 'Zippered pockets'], composition='100% Polyester', stock=70),
    dict(name='Manchester United Track Jacket', slug='man-united-track-jacket', club='Manchester United', category='jacket', gender='men', price=5999, original_price=None, image_url='https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop', sizes=SIZES_JACKET, rating=4.3, reviews_count=54, description='Manchester United Track Jacket. Red style for every occasion.', features=['WindRunner technology', 'Packable design', 'Hidden media pocket'], composition='100% Nylon', stock=60),
    dict(name='Liverpool FC Windbreaker Jacket', slug='liverpool-windbreaker', club='Liverpool FC', category='jacket', gender='men', price=7499, original_price=None, image_url='https://images.unsplash.com/photo-1544966503-7cc5ad3b7c27?w=800&auto=format&fit=crop', sizes=SIZES_JACKET, is_new=True, rating=4.6, reviews_count=67, description='Official Liverpool FC Windbreaker. Beat the rain in Red style.', features=['Water-repellent fabric', 'Storm-FIT technology', 'Packable into hood'], composition='100% Recycled Nylon', stock=55),
    dict(name='Argentina Training Jacket 2024', slug='argentina-training-jacket', club='Argentina NT', category='jacket', gender='men', price=6999, original_price=None, image_url='https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop', sizes=SIZES_JACKET, is_new=True, rating=4.7, reviews_count=87, description='Official Argentina National Team Training Jacket. Light blue training like the World Champions.', features=['ClimaCool technology', 'AFA official', 'Full zip with pockets'], composition='100% Polyester', stock=90),
    dict(name='Real Madrid Kids Home Jersey 2024/25', slug='real-madrid-kids-home-2425', club='Real Madrid', category='club-jersey', gender='kids', price=2999, original_price=None, image_url='https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop', sizes=['S (6-7Y)', 'M (8-9Y)', 'L (10-11Y)', 'XL (12-13Y)'], is_new=True, is_featured=True, rating=4.8, reviews_count=123, description='Official Real Madrid Home Jersey for kids 2024/25. Let the next generation wear white.', features=['Kids Dri-FIT technology', 'Badge embroidery', 'Regular fit'], composition='100% Recycled Polyester', stock=100),
    dict(name='FC Barcelona Kids Home Jersey 2024/25', slug='barcelona-kids-home-2425', club='FC Barcelona', category='club-jersey', gender='kids', price=2999, original_price=None, image_url='https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop', sizes=['S (6-7Y)', 'M (8-9Y)', 'L (10-11Y)', 'XL (12-13Y)'], is_new=True, rating=4.7, reviews_count=95, description='Official FC Barcelona Home Jersey for kids 2024/25. Blaugrana for little Barça fans.', features=['Kids ClimaCool technology', 'Badge embroidery', 'Comfortable fit'], composition='100% Recycled Polyester', stock=85),
]


def seed():
    app = create_app()
    with app.app_context():
        create_tables()

        execute('DELETE FROM order_items')
        execute('DELETE FROM orders')
        execute('DELETE FROM products')

        for p in PRODUCTS:
            execute(
                """INSERT INTO products
                   (name, slug, description, price, original_price, category, club, gender,
                    sizes, image_url, features, composition,
                    is_new, is_bestseller, is_featured, is_on_sale, stock, rating, reviews_count)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                (
                    p['name'], p['slug'], p.get('description', ''),
                    p['price'], p.get('original_price'),
                    p['category'], p.get('club', ''), p.get('gender', 'men'),
                    p.get('sizes', []), p.get('image_url', ''),
                    p.get('features', []), p.get('composition', ''),
                    p.get('is_new', False), p.get('is_bestseller', False),
                    p.get('is_featured', False), p.get('is_on_sale', False),
                    p.get('stock', 0),
                    p.get('rating', 0.0), p.get('reviews_count', 0),
                ),
            )

        if not fetchone('SELECT id FROM users WHERE email = %s', ('test@jerseyshop.com',)):
            execute(
                'INSERT INTO users (name, email, password_hash) VALUES (%s,%s,%s)',
                ('Test User', 'test@jerseyshop.com', hash_password('password123')),
            )

        if not fetchone('SELECT id FROM users WHERE email = %s', ('admin@jerseyshop.com',)):
            execute(
                'INSERT INTO users (name, email, password_hash, is_admin) VALUES (%s,%s,%s,%s)',
                ('Admin', 'admin@jerseyshop.com', hash_password('admin123'), True),
            )

        print(f'[OK] Seeded {len(PRODUCTS)} products, demo user, and admin user')


if __name__ == '__main__':
    seed()
