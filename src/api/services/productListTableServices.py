import os
from flask import jsonify
from flask_jwt_extended import get_jwt, jwt_required
from app import db
from models import ProductTable

import base64
import json


secreteKey = os.environ.get("SECRET_KEY")



# servicios TableProducts
def get_table_products_list():
    ProductTableList = ProductTable.query.all()
    sesiones_dict = {}

    for ProductTable in ProductTableList:
        if ProductTable.id_session not in sesiones_dict:
            sesiones_dict[ProductTable.id_session] = {
                'id_session': ProductTable.id_session,
                'products': []
            }
        
        sesiones_dict[ProductTable.id_session]['products'].append(ProductTable.to_dict())

    sesiones_list = list(sesiones_dict.values())
    return sesiones_list
    
    
# Función para obtener los products de una mesa por ID de mesa
def get_productTable_byId(id_session):
    productTableList = ProductTable.query.filter_by(id_sesion=id_session).all()
    if not productTableList:
        return None
    return [ProductTable.to_dict() for ProductTable in productTableList]

