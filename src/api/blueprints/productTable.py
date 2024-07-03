"""
    Blueprints que definen las rutas de API para los productos
    Definen las rutas de API para gestionar mesas y productos.
    Utilizan las funciones de servicios para interactuar con la base de datos y procesar la lógica de negocio.
"""
from flask import Blueprint, request, jsonify
from services.productListTableServices import get_table_products_list, get_productTable_byId
productTable_bp = Blueprint('producttable', __name__)



# Obtener todos los mesa-productos
@productTable_bp.route('/producttablelist', methods=['GET'])
def get_product_table_list_route():
    sesiones = get_table_products_list()
    return jsonify(sesiones), 200

@productTable_bp.route('/producttablelist/<int:mesa_id>', methods=['GET'])
def get_productTable_by_id(mesa_id):
    productos = get_productTable_byId(mesa_id)
    if not productos:
        return jsonify({"message": "No products found for this table"}), 404
    
    return jsonify(productos), 200
# Estas rutas hay que cambiarlas para mesa-productos
# @mesaProducto_bp.route('/products/<int:product_id>', methods=['PUT'])
# def update_product_route(product_id):
#     body = request.json
#     product_name = body.get('nombre')
#     product_price = body.get('precio')
#     product_description = body.get('descripcion')
#     if not product_name or not product_price:
#         return jsonify({"message": "Missing product name or price"}), 400

#     updated_product = update_product(product_id, product_name, product_price, product_description)
#     if not updated_product:
#         return jsonify({"message": "Product not found"}), 404

#     return jsonify({"nombre producto": updated_product.nombre, "id": updated_product.id, "precio": updated_product.precio, "descripcion": updated_product.descripcion}), 200

# @mesaProducto_bp.route('/products/<int:product_id>', methods=['DELETE'])
# def delete_product_route(product_id):
#     deleted_product = delete_product(product_id)
#     if not deleted_product:
#         return jsonify({"message": "Product not found"}), 404

#     return jsonify({"message": "Product deleted", "nombre producto": deleted_product.nombre, "id": deleted_product.id}), 200




