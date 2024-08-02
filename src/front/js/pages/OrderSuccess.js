import React, { useContext, useEffect, useState } from 'react';
import { Link,useParams } from 'react-router-dom';
import { Navbar } from "../component/navbar";
import { Footer } from "../component/footer";
import { Context } from '../store/appContext';

export const OrderSuccess = () => {
    const { restaurantId, tableId} = useParams();
    const { store,actions } = useContext(Context);
    const [paymentStatus, setPaymentStatus] = useState("")
    const handleBackToMenu = () => {
        actions.clearCart(); 
    };
    const totalPrice = store.cart.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);

    
    return (
        <>
            {/* <Navbar /> */}
            <div className="order-success">
                {/* <h2>Thanks for your order</h2> */}
                <div className="success-message">
                    Your order has been placed successfully!
                </div>
                <br />
                <div className="ordered-items-list">
                    <h3>Your order:</h3>
                    <ul>
                        {store.cart.map((item, index) => (
                            <li key={index}>
                                <div>{item.name}</div>
                                <div>x {item.quantity}</div>
                                <div>${item.price}</div>
                            </li>
                        ))}
                    </ul>
                    <div className='order-total'>
                        <h5>Total:</h5> 
                        <h5>${totalPrice.toFixed(2)}</h5>
                    </div>
                </div>
                <Link to={`/app/generate-qr/app/restaurants/${restaurantId}/tables/${tableId}/menu`}>
                    <button className="button1" onClick={handleBackToMenu}>Back to Menu</button>
                </Link>
            </div>
            {/* <Footer /> */}
        </>
    );
};

