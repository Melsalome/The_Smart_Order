"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""

# from flask import Flask, request, jsonify, url_for, Blueprint
# from .modelUser import db, Table, Restaurant, Menu

import io
import qrcode
from flask import Flask, request, jsonify, url_for, Blueprint, send_file
from api.models import db
from models import User, Table, Restaurant, Menu, Order, OrderItem
from api.utils import generate_sitemap, APIException




api = Blueprint('api', __name__)

# Allow CORS requests to this API


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200


