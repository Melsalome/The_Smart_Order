
import os
from flask import jsonify
from flask_jwt_extended import get_jwt, jwt_required
from app import db
from models import  User
import base64
import json


secreteKey = os.environ.get("SECRET_KEY")


## USUARIOS 

def create_user(restaurant_name, first_name,last_name, email, password,role):
    if User.query.filter_by(email=email).first():
        return None, "User already exists"
    new_user = User(restaurant_name = restaurant_name, first_name=first_name, last_name=last_name,email=email,role=role)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    return new_user.to_dict(), None

def authenticate_user(email, password):
    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        return user.to_dict(), None
    return None, "Invalid email or password"



#Esta funcion 
def role_required(role):
    def wrapper(fn):
        @jwt_required()
        def decorator(*args, **kwargs):
            claims = get_jwt()
            if role not in claims['roles']:
                return jsonify({"message": "Permission denied"}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

def get_all_users():
    return [user.to_dict() for user in User.query.all()]

# desencriptar data
