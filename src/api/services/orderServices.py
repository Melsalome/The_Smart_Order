from flask import jsonify
from flask_jwt_extended import get_jwt, jwt_required
from app import db
from models import Order

def get_active_order_list():
   return [order.to_dict() for order in Order.query.filter_by(status='pending').all()]

