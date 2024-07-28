import React, { useContext } from 'react';
import { Link,useParams } from 'react-router-dom';
import { Navbar } from "../component/navbar";
import { Footer } from "../component/footer";
import { Context } from '../store/appContext';

export const SuccessPage = () => {
    // const { restaurantId, tableId} = useParams();
    // const { store,actions } = useContext(Context);
    // const handleBackToMenu = () => {
    //     actions.clearCart(); 
    // };
    // const totalPrice = store.cart.reduce((total, item) => {
    //     return total + (item.price * item.quantity);
    // }, 0);
    return (
        <>
            {/* <Navbar /> */}
            <div className="order-success">
                {/* <h2>Thanks for your order</h2> */}
                <div className="success-message">
                    Thanks for your order! Your payment has been processed successfully!
                </div>
                
               
                {/* <Link to={`/app/generate-qr/app/restaurants/${restaurantId}/tables/${tableId}/menu`}>
                    <button className="button1" onClick={handleBackToMenu}>Back to Menu</button>
                </Link> */}
            </div>
            {/* <Footer /> */}
        </>
    );
};
