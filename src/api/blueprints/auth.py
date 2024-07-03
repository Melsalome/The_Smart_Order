from flask import Flask, Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from services.userServices import create_user, authenticate_user,get_all_users


auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    body = request.json
    first_name = body.get('first name')
    last_name = body.get("last name")
    restaurant_name = body.get("restaurant name")
    email = body.get('email')
    password = body.get('password')
    role = body.get('role')
    if not email or not password:
        return jsonify({"message": "email and password are required"}), 400
    if not role:
        new_user = create_user(restaurant_name,first_name, last_name,email, password)
        return jsonify(new_user), 201
    new_user, error = create_user(restaurant_name,first_name, last_name, email, password, role)
        
    if error:
        return jsonify({"message": error}), 400
    

    return jsonify(new_user), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    body = request.json
    email = body.get('email')
    password = body.get('password')
    if not email or not password:
        return jsonify({"message": "email and password are required"}), 400

    user, error = authenticate_user(email, password)
    if error:
        return jsonify({"message": error}), 401

    # Información adicional a pasar en el token
    additional_claims = {
        'email': user['email'],
        'roles': user.get('role', [])
    }
    access_token = create_access_token(identity=user['id'], additional_claims=additional_claims)
    return jsonify(access_token=access_token), 200

@auth_bp.route('/all', methods=['GET'])
def get_all():
    return jsonify(get_all_users()), 200