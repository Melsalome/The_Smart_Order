import React, { useContext } from 'react';
import { Link,useParams } from 'react-router-dom';
import { Navbar } from "../component/navbar";
import { Footer } from "../component/footer";
import { Context } from '../store/appContext';

// export const SuccessPage = () => {
//     // const { restaurantId, tableId} = useParams();
//     // const { store,actions } = useContext(Context);
//     // const handleBackToMenu = () => {
//     //     actions.clearCart(); 
//     // };
//     // const totalPrice = store.cart.reduce((total, item) => {
//     //     return total + (item.price * item.quantity);
//     // }, 0);
//     return (
//         <>
//             {/* <Navbar /> */}
//             {/* <div className="order-success"> */}
//                 {/* <h2>Thanks for your order</h2> */}
//                 {/* <div className="success-message"> */}
//                     {/* Thanks for your order! Your payment has been processed successfully! */}
//                 {/* </div> */}
                
               
//                 {/* <Link to={`/app/generate-qr/app/restaurants/${restaurantId}/tables/${tableId}/menu`}>
//                     <button className="button1" onClick={handleBackToMenu}>Back to Menu</button>
//                 </Link> */}
//             {/* </div> */}
//             {/* <Footer /> */}
            
//         </>
//     );
// };

export const SuccessPage = () => {
    useEffect(() => {
      const fetchPaymentStatus = async () => {
        const sessionId = new URLSearchParams(window.location.search).get('session_id');
        if (sessionId) {
          try {
            const response = await axios.get(`${process.env.BACKEND_URL}/stripe/checkout-session`, {
              params: { session_id: sessionId },
            });
            const { payment_status } = response.data;
            if (payment_status === 'paid') {
                try {
                  const createOrderResponse = await axios.post(`${process.env.BACKEND_URL}/orders`, {
                    cart: cartItems,
                    payment_status: 'paid',
                  });
                  // Manejar el resultado de la creación de la orden
                } catch (error) {
                  console.error('Error creating order:', error);
                }
              }
          } catch (error) {
            console.error('Error verifying payment status:', error);
          }
        }
      };
  
      fetchPaymentStatus();
    }, []);
  
    return <div>Processing your payment...</div>;
  };





  