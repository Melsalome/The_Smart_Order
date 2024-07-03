  
import os
from flask_admin import Admin
from flask_sqlalchemy import SQLAlchemy
from models import User, Table, Restaurant, Menu, Order, OrderItem, Invoice
from flask_admin.contrib.sqla import ModelView
from app import db


def setup_admin(app):
    app.secret_key = os.environ.get('SQLALCHEMY_DATABASE_URI', 'sample key')
    app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'
    admin = Admin(app, name='4Geeks Admin', template_mode='bootstrap3')

    
    # Add your models here, for example this is how we add a the User model to the admin
    admin.add_view(ModelView(User, db.session))
    admin.add_view(ModelView(Restaurant, db.session))
    admin.add_view(ModelView(Menu, db.session))
    admin.add_view(ModelView(Table, db.session))
    admin.add_view(ModelView(Order, db.session))
    admin.add_view(ModelView(OrderItem, db.session))
    admin.add_view(ModelView(Invoice, db.session))
    # admin.add_view(ModelView(Mesa, db.session))

    # You can duplicate that line to add mew models
    # admin.add_view(ModelView(YourModelName, db.session))