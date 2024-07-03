"""
    Blueprints que definen las rutas de API para las mesas
    
    Definen las rutas de API para gestionar mesas y productos.
    Utilizan las funciones de servicios para interactuar con la base de datos y procesar la lógica de negocio.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt, jwt_required
from services.tableServices import create_table, get_all_tables, assign_client_to_table
from services.sessionServices import create_session
from services.invoiceServices import generate_invoice
from services.tableServices import delete_table, update_table_number
from models import Table
from app import db

table_bp = Blueprint('tables', __name__)



# Crear una nueva mesa
@table_bp.route('/tables', methods=['POST'])
def add_table():
    body = request.json
    table_number = body.get('table_number')
    position_x = body.get('position_x')
    position_y = body.get('position_y')
    icon = body.get('icono')
    if not table_number:
        return jsonify({"message": "table_number is required"}), 400

    new_table = create_table(table_number, position_x, position_y, icon)
    return jsonify(new_table), 201

# Obtener todas las mesas
@table_bp.route('/tables', methods=['GET'])
# @role_required('admin') 
def get_tables_list():
    tables = get_all_tables()
    return jsonify(tables), 200


# Asignar un cliente a una mesa
@table_bp.route('/tables/<int:table_id>/<int:client_id>/client', methods=['POST'])
def assign_client_to_table_route(table_id,client_id):
    if not client_id:
        return jsonify({"message": "Client ID is required"}), 400
    
    session = create_session(table_id, client_id)
    if not session:
        return jsonify({"message": "Error creating session"}), 500

    return jsonify(session), 200


# Generar una factura
@table_bp.route('/tables/<int:table_id>/invoice', methods=['POST'])
def generate_invoice_route(table_id):
    body = request.json
    payment_method = body.get('payment_method')
    if not payment_method:
        return jsonify({"message": "payment_method is required"}), 400

    factura = generate_invoice(table_id, payment_method)
    if not factura:
        return jsonify({"message": "No approved orders for this table"}), 404

    return jsonify(factura), 201


# Eliminar mesa 
@table_bp.route('/tables/<int:table_number>', methods=['DELETE'])
def delete_table_route(table_number):
    deleted_table = delete_table(table_number)
    if not deleted_table:
        return jsonify({"message": "Table not found"}), 404

    return jsonify({"message": "Table deleted", **deleted_table}), 200

@table_bp.route('/tables/<int:number_table>', methods=['PUT'])
def update_table(number_table):
    data = request.json
    table = Table.query.filter_by(table_number=number_table).first()
    if not table:
        return jsonify({"error": "Table not found"}), 404
    
    table.position_x = data.get('position_x', table.position_x)
    table.position_y = data.get('position_y', table.position_y)
    db.session.commit()
    
    return jsonify(table.to_dict()), 200

@table_bp.route('/tables/<int:table_id>/update/number', methods=['PATCH'])
def update_table_number_route(table_id):
    body = request.json
    table_number = body.get('table_number')
    

    if not table_number:
        return jsonify({"message": "table_number is required"}), 400

    updated_table_number = update_table_number(table_id, table_number)
    if not updated_table_number:
        return jsonify({"message": "not table found"}), 404

    return jsonify(updated_table_number), 200