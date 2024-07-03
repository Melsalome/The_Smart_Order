from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt, jwt_required, create_access_token
from datetime import datetime, timezone
from models import User, db, Restaurant, Table, Menu, Order, OrderItem, Invoice
from services.orderServices import get_active_order_list

restaurants_bp = Blueprint('restaurants', __name__)

@restaurants_bp.route('/restaurants', methods=['GET'])
def get_all_restaurants():
    restaurants = Restaurant.query.all()
    return jsonify([restaurant.serialize() for restaurant in restaurants]), 200

@restaurants_bp.route('/restaurants/<int:restaurant_id>', methods=['GET'])
def get_restaurant(restaurant_id):
    restaurant = Restaurant.query.filter_by(id=restaurant_id).first()
    if restaurant:
        return jsonify(restaurant.serialize()), 200
    else:
        return jsonify({'error': 'Restaurant not found'}), 404
    
@restaurants_bp.route('/restaurants', methods=['POST'])
def add_restaurant():
    data = request.json
    new_restaurant = Restaurant(name=data['name'])
    db.session.add(new_restaurant)
    db.session.commit()
    return jsonify(new_restaurant.serialize()), 201

@restaurants_bp.route('/restaurants/<int:restaurant_id>/tables', methods=['POST'])
def add_table(restaurant_id):
    data = request.get_json()
    new_table = Table(restaurant_id=restaurant_id, number=data['table_number'])
    db.session.add(new_table)
    db.session.commit()
    return jsonify(new_table.serialize()), 201

@restaurants_bp.route('/restaurants/<int:restaurant_id>/tables/<int:table_id>', methods=['GET'])
def get_table(restaurant_id, table_id):
    table = Table.query.filter_by(id=table_id, restaurant_id=restaurant_id).first()
    if table:
        return jsonify(table.serialize()), 200
    return jsonify({"error": "Table not found"}), 404

@restaurants_bp.route('/restaurants/<int:restaurant_id>/tables/<int:table_id>', methods=['PUT'])
def update_table(restaurant_id, table_id):
    data = request.get_json()
    table = Table.query.filter_by(id=table_id, restaurant_id=restaurant_id).first()
    if table:
        table.number = data['table_number']
        db.session.commit()
        return jsonify(table.serialize()), 200
    return jsonify({"error": "Table not found"}), 404

@restaurants_bp.route('/restaurants/<int:restaurant_id>/tables/<int:table_id>', methods=['DELETE'])
def delete_table(restaurant_id, table_id):
    table = Table.query.filter_by(id=table_id, restaurant_id=restaurant_id).first()
    if table:
        db.session.delete(table)
        db.session.commit()
        return jsonify({"message": "Table deleted"}), 200
    return jsonify({"error": "Table not found"}), 404

@restaurants_bp.route('/restaurants/<int:restaurant_id>/tables/<int:table_id>/menu', methods=['GET'])
def get_menu(restaurant_id, table_id):
    restaurant = Restaurant.query.get(restaurant_id)
    if not restaurant:
        return jsonify({"error": "Restaurant not found"}), 404

    table = Table.query.filter_by(id=table_id, restaurant_id=restaurant_id).first()
    if not table:
        return jsonify({"error": "Table not found"}), 404

    menu_items = Menu.query.filter_by(restaurant_id=restaurant_id).all()
    return jsonify([item.serialize() for item in menu_items]), 200

@restaurants_bp.route('/restaurants/<int:restaurant_id>/tables/<int:table_id>/menu', methods=['POST'])
def add_menu_item(restaurant_id, table_id):
    restaurant = Restaurant.query.get(restaurant_id)
    if not restaurant:
        return jsonify({"error": "Restaurant not found"}), 404

    table = Table.query.filter_by(id=table_id, restaurant_id=restaurant_id).first()
    if not table:
        return jsonify({"error": "Table not found"}), 404

    data = request.json
    new_menu_item = Menu(
        name=data['name'],
        description=data['description'],
        price=data['price'],
        category=data['category'],
        restaurant_id=restaurant_id
    )
    db.session.add(new_menu_item)
    db.session.commit()
    return jsonify(new_menu_item.serialize()), 201

@restaurants_bp.route('/restaurants/<int:restaurant_id>/tables/<int:table_id>/menu/<int:item_id>', methods=['PUT'])
def update_menu_item(restaurant_id, table_id, item_id):
    menu_item = Menu.query.filter_by(id=item_id, restaurant_id=restaurant_id).first()
    if not menu_item:
        return jsonify({"error": "Menu item not found"}), 404

    table = Table.query.filter_by(id=table_id, restaurant_id=restaurant_id).first()
    if not table:
        return jsonify({"error": "Table not found"}), 404

    data = request.json
    menu_item.name = data.get('name', menu_item.name)
    menu_item.description = data.get('description', menu_item.description)
    menu_item.price = data.get('price', menu_item.price)
    menu_item.category = data.get('category', menu_item.category)

    db.session.commit()
    return jsonify(menu_item.serialize()), 200

@restaurants_bp.route('/restaurants/<int:restaurant_id>/tables/<int:table_id>/menu/<int:item_id>', methods=['DELETE'])
def delete_menu_item(restaurant_id, table_id, item_id):
    menu_item = Menu.query.filter_by(id=item_id, restaurant_id=restaurant_id).first()
    if not menu_item:
        return jsonify({"error": "Menu item not found"}), 404

    table = Table.query.filter_by(id=table_id, restaurant_id=restaurant_id).first()
    if not table:
        return jsonify({"error": "Table not found"}), 404

    db.session.delete(menu_item)
    db.session.commit()
    return jsonify({"message": "Menu item deleted successfully"}), 200

@restaurants_bp.route('/restaurants/<int:restaurant_id>/tables/<int:table_id>/orders', methods=['POST'])
def create_order(restaurant_id, table_id):
    data = request.json
    comment = data.get('comment', '')
    payment_method = data['payment_method']
    status = data.get('pending')
    items = data['items']
  

    total_price = sum(item['price'] * item['quantity'] for item in items)

    order = Order(
        restaurant_id=restaurant_id,
        table_id=table_id,
        comment=comment,
        payment_method=payment_method,
        total_price=total_price,
        created_at=datetime.now(timezone.utc),
        status=status
        
    )
    db.session.add(order)
    db.session.commit()

    for item in items:
        menu_id = item['menu_id']
        name = item['name']
        quantity = item['quantity']
        price = item['price']
        order_item = OrderItem(
            order_id=order.id,
            menu_id=menu_id,
            name=name,
            quantity=quantity,
            price=price
        )
        db.session.add(order_item)

    db.session.commit()

    return jsonify(order.serialize()), 201

@restaurants_bp.route('/restaurants/<int:restaurant_id>/tables/<int:table_number>/orders/<int:order_id>', methods=['GET'])
def get_order(restaurant_id, table_number, order_id):
    order = Order.query.filter_by(id=order_id, restaurant_id=restaurant_id, table_number=table_number).first()
    if order is None:
        return jsonify({"error": "Order not found"}), 404

    order_items = OrderItem.query.filter_by(order_id=order_id).all()
    items = [item.serialize() for item in order_items]

    response = order.serialize()
    response['items'] = items

    return jsonify(response), 200

@restaurants_bp.route('/<int:restaurant_id>/pending/orders/<int:order_id>', methods=['PATCH'])
def update_order_status_route(restaurant_id, order_id):
   
    
    if not order_id:
        return jsonify({"message": "order_id is required"}), 400
    
    try:
        order = Order.query.filter_by(id=order_id, restaurant_id=restaurant_id, status='pending').first()
        
        if not order:
            return jsonify({"message": "Order not found or not in pending status"}), 404

        order.status = 'done'
        db.session.commit()

        return jsonify(order.serialize()), 200
    except Exception as error:
        return jsonify({"error": str(error)}), 500
    
@restaurants_bp.route('/restaurants/<int:restaurant_id>/orders', methods=['GET'])
def get_all_order(restaurant_id):
    orders = Order.query.filter_by(restaurant_id=restaurant_id).all()
    return jsonify([order.serialize() for order in orders]), 200

@restaurants_bp.route('/restaurants/<int:restaurant_id>/tables/<int:table_id>/orders/<int:order_id>', methods=['PUT'])
def update_order(restaurant_id, table_id, order_id):
    data = request.json
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404

    order.comment = data.get('comment', order.comment)
    order.payment_method = data['payment_method']
    
    total_price = 0
    new_items = data['items']
    
    OrderItem.query.filter_by(order_id=order_id).delete()
    
    for item in new_items:
        menu_id = item['menu_id']
        name = item['name']
        quantity = item['quantity']
        price = item['price']
        total_price += price * quantity
        order_item = OrderItem(
            order_id=order.id,
            menu_id=menu_id,
            name=name,
            quantity=quantity,
            price=price
        )
        db.session.add(order_item)

    order.total_price = total_price

    db.session.commit()
    return jsonify(order.serialize()), 200

@restaurants_bp.route('/restaurants/<int:restaurant_id>/tables/<int:table_id>/orders/<int:order_id>', methods=['DELETE'])
def delete_order(restaurant_id, table_id, order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404

    OrderItem.query.filter_by(order_id=order_id).delete()
    
    db.session.delete(order)
    db.session.commit()

    return '', 204

@restaurants_bp.route('/restaurants/<int:restaurant_id>/orders/pending', methods=['GET'])
def get_order_pending_route(restaurant_id):
    try:
        pending_orders = Order.query.filter_by(restaurant_id=restaurant_id, status='pending').all()
        return jsonify([order.serialize() for order in pending_orders]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500





@restaurants_bp.route('/restaurants/<int:restaurant_id>/tables/<int:table_id>/invoices', methods=['POST'])
def create_invoices(restaurant_id, table_id):
    data = request.json
    order_id = data.get('order_id')
    if not order_id:
        return jsonify({'error': 'Order ID is required'}), 400 
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
 
    existing_invoice = Invoice.query.filter_by(order_id=order_id).first()
    if existing_invoice:
        return jsonify({'error': 'Invoice already exists for this order'}), 400
      
    total_price = order.total_price

    new_invoice = Invoice(
        order_id=order_id,
        restaurant_id=order.restaurant_id,
        table_number=order.table_id,
        total_price=total_price,
       
    )
    db.session.add(new_invoice)
    db.session.commit()

    order_items = OrderItem.query.filter_by(order_id=order_id).all()
    serialized_order_items = [item.serialize() for item in order_items]

    response_data = {
            'invoice_id': new_invoice.id,
            'restaurant_id': order.restaurant_id,
            'table_id': order.table_id,
        
            'total_price': total_price,
            'payment_method': order.payment_method,
            'order_items': serialized_order_items
        }

    return jsonify(response_data), 201

@restaurants_bp.route('/restaurants/<int:restaurant_id>/tables/<int:table_number>/invoices/<int:invoice_id>', methods=['GET'])
def get_invoice(restaurant_id, table_id, invoice_id):
    invoice = Invoice.query.get(invoice_id)
    if not invoice:
        return jsonify({'error': 'Invoice not found'}), 404

    order_items = OrderItem.query.filter_by(order_id=invoice.order_id).all()
    serialized_order_items = [item.serialize() for item in order_items]

    response_data = {
        'invoice_id': invoice.id,
        'restaurant_id': invoice.restaurant_id,
        'table_number': invoice.table_number,
     
        'total_price': invoice.total_price,
        'order_items': serialized_order_items
    }

    return jsonify(response_data), 200

@restaurants_bp.route('/restaurants/<int:restaurant_id>/tables/<int:table_id>/invoices', methods=['GET'])
def get_all_invoice(restaurant_id,table_id):
    invoices = Invoice.query.filter_by(restaurant_id=restaurant_id, table_id=table_id).all()
    
    if not invoices:
        return jsonify({'error': 'No invoices found for this restaurant and table'}), 404
    
    serialized_invoices = []
    for invoice in invoices:
        order_items = OrderItem.query.filter_by(order_id=invoice.order_id).all()
        serialized_order_items = [item.serialize() for item in order_items]

        serialized_invoice = {
            'invoice_id': invoice.id,
            'restaurant_id': invoice.restaurant_id,
            'table_id': invoice.table_id,
       
            'total_price': invoice.total_price,
            'order_items': serialized_order_items
        }
        serialized_invoices.append(serialized_invoice)

    return jsonify(serialized_invoices), 200

