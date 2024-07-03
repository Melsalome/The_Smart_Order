from flask import jsonify
from flask_jwt_extended import get_jwt, jwt_required
from app import db
from models import  Product, ProductTable, TableSession


##Servicios de producto
# Crear un nuevo producto
def create_product(name, price, description, image, category ):
    new_product = Product(name=name, price=price, description=description, image=image,category=category)
    db.session.add(new_product)
    db.session.commit()
    return new_product.to_dict()

# Obtener todos los proyectos
def get_all_products():
  return [product.to_dict() for product in Product.query.all()]


# Actualizar un producto

def update_product(product_id, name, price, description, image, category):
    product = Product.query.get(product_id)
    if not product:
        return None
    product.name = name
    product.price = price
    product.description = description
    product.image = image
    product.category = category
    db.session.commit()
    return product.to_dict()

# Obtener producto por id 
def get_product_by_id(product_id):
    product = Product.query.get(product_id)
    if not product:
        return None
    return product.to_dict()

# Eliminar un producto
def delete_product(product_id):
    ProductTable.query.filter_by(id_product=product_id).update({ProductTable.id_product: None})
    product = Product.query.get(product_id)
    if not product:
        return None
    
    db.session.delete(product)
    db.session.commit()
    return product.to_dict()