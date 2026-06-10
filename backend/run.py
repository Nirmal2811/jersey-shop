from app import create_app
from app.db import create_tables

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        try:
            create_tables()
            print('Database tables ready.')
        except Exception as e:
            print(f'WARNING: Could not create tables: {e}')
            print('Check your DATABASE_URL in .env')
    app.run(debug=True, port=5000)
