"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import io
import qrcode
import os
from flask import Flask, request, jsonify, url_for, send_from_directory, send_file
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap

from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from blueprints.table import table_bp
from blueprints.product import product_bp
from blueprints.client import client_bp
from blueprints.productTable import productTable_bp
from blueprints.sessions import sessions_bp
from blueprints.auth import auth_bp
from blueprints.restaurants import restaurants_bp
from blueprints.generateqr import generateqr_bp
from flask_jwt_extended import JWTManager
from flask_cors import CORS





# Allow CORS requests to this API


# Configura la extensión Flask-JWT-Extended

# from models import Person

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../public/')
app = Flask(__name__)
db = SQLAlchemy(app)
CORS(app)

app.config["JWT_SECRET_KEY"] = "super-secret"  # ¡Cambia las palabras "super-secret" por otra cosa!
jwt = JWTManager(app)
app.url_map.strict_slashes = False

# database condiguration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# add the admin
setup_admin(app)

# add the admin
setup_commands(app)

# Add all endpoints form the API with a "api" prefix
app.register_blueprint(table_bp, url_prefix='/app')
app.register_blueprint(product_bp, url_prefix='/app')
app.register_blueprint(client_bp, url_prefix='/app')
app.register_blueprint(productTable_bp, url_prefix='/app')
app.register_blueprint(sessions_bp, url_prefix='/app')
app.register_blueprint(auth_bp, url_prefix='/app')
app.register_blueprint(restaurants_bp, url_prefix='/app')
app.register_blueprint(generateqr_bp, url_prefix='/app')
# Handle/serialize errors like a JSON object


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints


@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# any other endpoint will try to serve it like a static file


@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response

# @app.route('/admin/generate_qr', methods=['POST'])
# def generate_qr(restaurant_id,table_id):
#     data = request.json
#     restaurant_id = data.get('restaurant_id')
#     table_id = data.get('table_id')

#     if not restaurant_id or not table_id:
#         return jsonify({"error": "Restaurant ID and Table ID are required"}), 400

#     url = f"https://humble-pancake-977xqppgr6q427j55-3001.app.github.dev/api/restaurants/{restaurant_id}/tables/{table_id}/menu"
#     qr = qrcode.QRCode(
#         version=1,
#         error_correction=qrcode.constants.ERROR_CORRECT_L,
#         box_size=10,
#         border=4,
#     )
#     qr.add_data(url)
#     qr.make(fit=True)

#     img = qr.make_image(fill='black', back_color='white')
#     buffer = io.BytesIO()
#     img.save(buffer, 'PNG')
#     buffer.seek(0)

#     return send_file(buffer, mimetype='image/png', as_attachment=True, download_name=f"qr_restaurant_{restaurant_id}_table_{table_id}.png")
def generate_qr_code(restaurant_id, table_id):
    url = f"${process.env.BACKEND_URL}/app/restaurants/{restaurant_id}/tables/{table_id}/menu"
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill='black', back_color='white')
    img.save(f"qr_restaurant_{restaurant_id}_table_{table_id}.png")
    print(f"QR code generated for Restaurant ID: {restaurant_id}, Table ID: {table_id}")

@app.route('/api/restaurants/<int:restaurant_id>/tables/<int:table_id>/generate_qr', methods=['GET'])
def generate_qr(restaurant_id, table_id):
  # cambiar url
    url = f"https://humble-pancake-977xqppgr6q427j55-3000.app.github.dev/app/restaurants/{restaurant_id}/tables/{table_id}/menu"
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill='black', back_color='white')
    buffer = io.BytesIO()
    img.save(buffer, 'PNG')
    buffer.seek(0)

    return send_file(buffer, mimetype='image/png', as_attachment=True, download_name=f"qr_restaurant_{restaurant_id}_table_{table_id}.png")
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
