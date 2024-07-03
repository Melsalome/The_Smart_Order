"""
    Logica de negocio y servicios
    
    Funciones para crear, obtener y gestionar mesas, productos y facturas.
    Incluye funciones para crear productos, obtener todos los productos, y generar facturas.
"""

import os
from flask import jsonify
from flask_jwt_extended import get_jwt, jwt_required
from app import db
from models import  ProductTable, Invoice, InvoiceDetail




# Servicios de facturas
# Generar una nueva factura
def generate_invoice(table_id, payment_method):
    orders = ProductTable.query.filter_by(id_mesa=table_id, estado='aprobado').all()
    if not orders:
        return None
    
    total = sum(order.product.price * order.quantity for order in orders)
    invoice = Invoice(id_mesa=table_id, total=total, payment_method=payment_method)
    db.session.add(invoice)
    db.session.commit()

    for order in orders:
        detail = InvoiceDetail(
            id_invoice=invoice.id,
            id_product=order.id_product,
            quantity=order.quantity,
            unit_price=order.product.price,
            subtotal=order.product.price * order.quantity
        )
        db.session.add(detail)
    
    db.session.commit()
    return invoice.to_dict()