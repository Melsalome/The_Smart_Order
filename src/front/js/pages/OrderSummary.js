import React, { useState, useEffect, useContext } from "react";
import axios from 'axios';
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { Context } from "../store/appContext";
import { Navbar } from "../component/navbar";
import { Footer } from "../component/footer";
import "../../styles/summary.css";

export const OrderSummary = () => {
  const { store, actions } = useContext(Context);
  const [comment, setComment] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const { restaurantId, tableId } = useParams();
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Verificar si se regresó de Stripe con un pago exitoso
    const query = new URLSearchParams(location.search);
    if (query.get('payment_status') === 'success') {
      setPaymentStatus('paid');
      const savedPaymentMethod = sessionStorage.getItem('paymentMethod');
      if (savedPaymentMethod){
        setPaymentMethod(savedPaymentMethod)
      }
      const savedCart = JSON.parse(sessionStorage.getItem('cart'));
      const savedComment = sessionStorage.getItem('comment');
      if (savedCart) {
        actions.setCart(savedCart);
      }
      if (savedComment) {
        setComment(savedComment);
      }
    } 
  }, [location.search]);

  const totalPrice = store.cart.reduce(
    (total, meal) => total + meal.price * meal.quantity,
    0
  );

  const handleCommentChange = (e) => {
    setComment(e.target.value);
    sessionStorage.setItem('comment', e.target.value); // Guardar el comentario en sessionStorage
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    sessionStorage.setItem('paymentMethod', method);
  };

  const handleCheckout = () => {
    // Guardar datos en sessionStorage antes de redirigir
    sessionStorage.setItem('cart', JSON.stringify(store.cart));
    sessionStorage.setItem('comment', comment);
    sessionStorage.setItem('restaurantId', restaurantId);
    sessionStorage.setItem('tableId', tableId);

    axios
      .post(`${process.env.BACKEND_URL}/stripe/create-checkout-session`, {
        cart: store.cart,
        restaurantId: restaurantId,
        tableId: tableId
      })
      .then((response) => {
        if (response.data.url) {
          window.location.href = response.data.url;
        }
      })
      .catch((err) => console.log(err.message));
  };

  
  const handleFinishOrder = async () => {
    if (!paymentMethod) {
      alert('Please choose your payment method!');
      return;
    }
  
    // Guardar método de pago en sessionStorage
    sessionStorage.setItem('paymentMethod', paymentMethod);
  
    try {
      if (paymentMethod === "cash") {
        // Crear la orden directamente
        const orderResult = await actions.createOrder(restaurantId, tableId, comment, paymentMethod, totalPrice);
        if (orderResult && orderResult.id) {
          const orderId = orderResult.id;

          // const invoiceResult = await actions.createInvoice(restaurantId, tableId, orderId);
          navigate(`/restaurants/${restaurantId}/tables/${tableId}/order-success`);
        } else {
          throw new Error('Order result is undefined or missing the order ID');
        }
      } else {
        // Si el método de pago es "stripe", maneja el proceso de pago de Stripe
        if (paymentStatus === 'paid') {
          await actions.addProductToTable(tableId, store.cart);
          const orderResult = await actions.createOrder(restaurantId, tableId, comment, paymentMethod, totalPrice, paymentStatus);
          if (orderResult && orderResult.id) {
            const orderId = orderResult.id;
            // Asumimos que createInvoice es opcional
            // const invoiceResult = await actions.createInvoice(restaurantId, tableId, orderId);
            navigate(`/restaurants/${restaurantId}/tables/${tableId}/order-success`);
          } else {
            throw new Error('Order result is undefined or missing the order ID');
          }
        } else {
          // Procesar si no se ha pagado (posiblemente manejar como 'pendiente')
          await actions.addProductToTable(tableId, store.cart);
          const orderResult = await actions.createOrder(restaurantId, tableId, comment, paymentMethod, totalPrice);
          if (orderResult && orderResult.id) {
            const orderId = orderResult.id;
            // Asumimos que createInvoice es opcional
            // const invoiceResult = await actions.createInvoice(restaurantId, tableId, orderId);
            navigate(`/restaurants/${restaurantId}/tables/${tableId}/order-success`);
          } else {
            throw new Error('Order result is undefined or missing the order ID');
          }
        }
      }
    } catch (error) {
      console.error('Error finishing order:', error);
      alert('Error finishing order. Please try again.');
    }
  };
  
  
  return (
    <>
      <Navbar />
      <div className="order-summary">
        <h2>Order Summary</h2>
        <ul>
          {store.cart.map((meal, index) => (
            <li key={index}>
              <div>{meal.name}</div>
              <div>x {meal.quantity}</div>
              <div>${(meal.price * meal.quantity).toFixed(2)}</div>
            </li>
          ))}
        </ul>
        <div className="total">
          <h5>Total Price: </h5>
          <h5>${totalPrice.toFixed(2)}</h5>
        </div>
        <div className="comments">
          <label htmlFor="comments">Comments:</label>
          <textarea
            id="comments"
            value={comment}
            onChange={handleCommentChange}
          ></textarea>
        </div>

        <div className="payment-method">
          <label htmlFor="payment">Payment Method:</label>
          <div className="payment-icons">
            <button
              className={paymentMethod === 'cash' ? 'selected' : ''}
              onClick={() => handlePaymentMethodChange('cash')}
              disabled={paymentStatus === 'paid'}
            >
              <i className="fa-solid fa-money-bill"></i> Pay at Cashier
            </button>
            <button
              className={paymentMethod === "stripe" ? "selected" : ""}
              onClick={() => [handlePaymentMethodChange("stripe"), handleCheckout()]}
              disabled={paymentStatus === 'paid'}
            >
              <i className="fa-solid fa-credit-card"></i> Pay with Card
            </button>
          </div>
        </div>

        {paymentStatus === 'paid' && (
          <div className="payment-success-message">
            Payment successful! You can now finish your order.
          </div>
        )}

        <div className='order-finish'>
          <button className='button1' onClick={handleFinishOrder}>Finish</button>
        </div>
      </div>
      <Footer />
    </>
  );
};
