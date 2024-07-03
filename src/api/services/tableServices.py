
from flask import jsonify
from flask_jwt_extended import get_jwt, jwt_required
from app import db
from models import Table, ProductTable, TableSession


# Servicios de Table : 

def create_table(table_number, position_x, position_y, icon):
    existing_table = Table.query.filter_by(table_number=table_number).first()
    if existing_table:
        return None, "Table already exists"
    
    new_table = Table(position_x = position_x, position_y = position_y,table_number=table_number, icon=icon, restaurant_id = 1, )
    db.session.add(new_table)
    db.session.commit()
    return new_table.to_dict()

def get_all_tables():
    return [Table.to_dict() for Table in Table.query.all()]


# Asignar cliente a mesa
def assign_client_to_table(table_number, client_id):
    table = Table.query.get(table_number)
    if not table:
        return None
    client = client.query.get(client_id)
    table.id_client = client.id
    db.session.commit()
    return client.to_dict()


# Actualizar estado de la mesa
def update_table_status(table_number, status):
    table = Table.query.filter_by(table_number=table_number).first()
    if table:
        table.status = status
        db.session.commit()
    return table.to_dict()


# Actualizar cliente de la mesa
def update_client_in_table(table_number, client_id):
    table = Table.query.filter_by(table_number=table_number).first()
    if table:
        table.id_client = client_id
        db.session.commit()
    return table.to_dict() 



def delete_table(table_number):
    table = Table.query.filter_by(table_number=table_number).first()
    if not table:
        return None
    
    sessions = TableSession.query.filter_by(id_table=table.id).all()
    for session in sessions:
        ProductTable.query.filter_by(id_session=session.id).delete()
        
    TableSession.query.filter_by(id_table=table.id).delete()
    db.session.delete(table)
    db.session.commit()
    return table.to_dict()


def update_table_number(table_id, table_number):
    table = Table.query.get(table_id)
    if not table:
        return None
    
    if table:
        table.table_number = table_number
        db.session.commit()
    return table.to_dict() 

    