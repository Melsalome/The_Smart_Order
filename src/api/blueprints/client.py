
from flask import Blueprint, request, jsonify
from services.clientServices import create_client, get_client_list
from services.productServices import update_product, delete_product
from flask_jwt_extended import jwt_required, get_jwt_identity

client_bp = Blueprint('client', __name__)


@client_bp.route('/client/create', methods=['POST'])
def add_client():
    body = request.json    
    client_name = body.get('name')
    if not client_name:
        new_client = create_client("anonimo")
        return jsonify(new_client), 201
    new_client = create_client(client_name)
    return jsonify(new_client), 201


@client_bp.route('/clients', methods=['GET'])
def get_clients():
    clients = get_client_list()
    return jsonify(clients), 200


@client_bp.route('/products/<int:product_id>', methods=['PUT'])
def update_product_route(product_id):
    body = request.json
    product_name = body.get('name')
    product_price = body.get('price')
    product_description = body.get('description')
    if not product_name or not product_price:
        return jsonify({"message": "Missing product name or price"}), 400

    updated_product = update_product(product_id, product_name, product_price, product_description)
    if not updated_product:
        return jsonify({"message": "Product not found"}), 404

    return jsonify({"product_name": updated_product.name, "id": updated_product.id, "price": updated_product.price, "description": updated_product.description}), 200

@client_bp.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product_route(product_id):
    deleted_product = delete_product(product_id)
    if not deleted_product:
        return jsonify({"message": "Product not found"}), 404

    return jsonify({"message": "Product deleted", "product_name": deleted_product.name, "id": deleted_product.id}), 200




