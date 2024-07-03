"""
    Blueprints que definen las rutas de API para las mesas
    
    Definen las rutas de API para gestionar mesas y productos.
    Utilizan las funciones de servicios para interactuar con la base de datos y procesar la lógica de negocio.
"""
from flask import Blueprint, request, jsonify
from services.userServices import generate_invoice

factura_bp = Blueprint('factura', __name__)

@factura_bp.route('/factura/<int:table_id>/invoice', methods=['POST'])
def generate_invoice_route(table_id):
    body = request.json
    metodo_pago = body.get('metodo_pago')
    if not metodo_pago:
        return jsonify({"message": "metodo_pago is required"}), 400

    factura = generate_invoice(table_id, metodo_pago)
    if not factura:
        return jsonify({"message": "No approved orders for this table"}), 404

    return jsonify({"id": factura.id, "total": factura.total, "metodo_pago": factura.metodo_pago, "fecha": factura.fecha}), 201
