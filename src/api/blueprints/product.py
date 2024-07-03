"""
    Blueprints que definen las rutas de API para los productos
    Definen las rutas de API para gestionar mesas y productos.
    Utilizan las funciones de servicios para interactuar con la base de datos y procesar la lógica de negocio.
"""
from flask import Blueprint, request, jsonify
from services.productServices import create_product, get_all_products, update_product, delete_product, get_product_by_id
product_bp = Blueprint('product', __name__)

# Crear un nuevo producto
@product_bp.route('/products/createproduct', methods=['POST'])
def add_product():
    body = request.json    
    product_name = body.get('name')
    product_price = body.get('price')
    product_description = body.get('description')
    product_image = body.get('image')
    product_category = body.get('category')
    if not product_name or not product_price:
        return jsonify({"message": "Missing product name or price"}), 400

    new_product = create_product(product_name, product_price, product_description, product_image, product_category)
    return jsonify(new_product), 201
# Obtener producto por id
@product_bp.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    products = get_product_by_id(product_id)
    if not products:
        return jsonify({"message": "No products found"}), 404
    return jsonify(products), 200

# Obtener todos los productos
@product_bp.route('/products', methods=['GET'])
def get_products():
    products = get_all_products()
    if not products:
        return jsonify({"message": "No products found"}), 404
    return jsonify(products), 200

# Actualizar un producto
@product_bp.route('/products/<int:product_id>', methods=['PUT'])
def update_product_route(product_id):
    body = request.json
    product_name = body.get('name')
    product_price = body.get('price')
    product_description = body.get('description')
    product_image = body.get('image')
    product_category = body.get('category')
    
    if not product_name or not product_price:
        return jsonify({"message": "Missing product name or price"}), 400

    updated_product = update_product(product_id,product_name, product_price, product_description, product_image, product_category)
    if not updated_product:
        return jsonify({"message": "Product not found"}), 404

    return jsonify(updated_product), 200

# Eliminar un producto
@product_bp.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product_route(product_id):
    deleted_product = delete_product(product_id)
    if not deleted_product:
        return jsonify({"message": "Product not found"}), 404

    return jsonify({"message": "Product deleted", **deleted_product}), 200




