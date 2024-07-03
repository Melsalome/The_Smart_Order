
import os
from flask import jsonify
from flask_jwt_extended import get_jwt, jwt_required
from app import db
from models import  Client
import base64
import json



# Servicios de cliente

# Crear un nuevo cliente
def create_client(name):
    new_client = Client(name=name)
    db.session.add(new_client)
    db.session.commit()
    return new_client.to_dict()

# Obtener todos los clientes
def get_client_list():
    return [client.to_dict() for client in Client.query.all()]
