import React, { useContext, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import "../../styles/navbar.css";
import { Context } from "../store/appContext";

export const Navbar = ({ onClose }) => {
    const { store, actions } = useContext(Context);
    const { restaurantId, tableId } = useParams();

    useEffect(() => {
        actions.getRestaurant(restaurantId);
    }, []);

    const totalAmount = store.cart.reduce((total, meal) => total + meal.price * meal.quantity, 0);
    const cartNotEmpty = store.cart.length > 0;

    const handleRemoveFromCart = (mealId) => {
        actions.removeFromCart(mealId);
    };

    return (
        <>
            <header className='nav-bar header'>
                <h1>{store.restaurant.name}</h1>

                <div className={`cart-container ${cartNotEmpty ? 'cart-active' : ''}`}>
                    <button className="btn btn-dark dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i className="fa-solid fa-cart-shopping"></i>
                        {cartNotEmpty && <span className="cart-length">{store.cart.reduce((total, meal) => total + meal.quantity, 0)}</span>}
                    </button>

                    <div className='dropdown-menu' aria-labelledby="dropdownMenuButton1">
                        {store.cart.length === 0 ? (
                            <li className="dropdown-item empty-cart-message">Your cart is empty</li>
                        ) : (
                            <ul className='cart-items'>
                                {store.cart.map((meal, index) => (
                                    <li className="dropdown-item cart-item" key={index}>
                                        <div className="cart-item-details">
                                            <p className='cart-name'>{meal.name}</p>
                                            <div className="cart-item-summary">
                                                <span className='quantity'>x {meal.quantity}</span>
                                                <span className='price'>${(meal.price * meal.quantity).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                                <li className="dropdown-item total-amount">
                                    <span>Total:</span>
                                    <span>${totalAmount.toFixed(2)}</span>
                                </li>
                                <li className="dropdown-item cart-actions">
                                    <button className="butt-close" onClick={onClose}>Close</button>
                                    <Link to={`/restaurants/${restaurantId}/tables/${tableId}/order-summary`}>
                                        <button className="butt-order">Order</button>
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
            </header>
            <div className='main-image'>
                <img src={store.restaurant.image} alt="Restaurant" />
            </div>
        </>
    );
};


