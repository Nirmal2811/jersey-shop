from app import create_app
from app.db import create_tables

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        create_tables()
    app.run(debug=True, port=5000)
