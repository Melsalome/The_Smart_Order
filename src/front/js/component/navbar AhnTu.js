import React, { useContext, useState, useEffect } from "react";
import { Link,useParams } from "react-router-dom";
import "../../styles/navbar.css";
import { Context } from "../store/appContext";


export const Navbar = ({onClose}) => {
	const { store, actions } = useContext(Context)
	const {restaurantId,tableId} = useParams()
	const totalAmount = store.cart.reduce((total, meal) => total + meal.price * meal.quantity, 0);
	const cartNotEmpty = store.cart.length > 0;

	useEffect(() => {
		actions.getRestaurant(restaurantId);
	}, []);

	return (
		<>
			<header className='nav-bar header'>
				<h1>{store.restaurant.name}</h1>
				
				<div className={`cart-container ${cartNotEmpty ? 'cart-active' : ''}`}>
					<button className="btn btn-dark dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
					 {/* {store.cart.length} */}
						<i class="fa-solid fa-cart-shopping"></i>
						{cartNotEmpty && <span className="cart-length">{store.cart.length}</span>}
						{/* <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="m480-560-56-56 63-64H320v-80h167l-64-64 57-56 160 160-160 160ZM280-80q-33 0-56.5-23.5T200-160q0-33 23.5-56.5T280-240q33 0 56.5 23.5T360-160q0 33-23.5 56.5T280-80Zm400 0q-33 0-56.5-23.5T600-160q0-33 23.5-56.5T680-240q33 0 56.5 23.5T760-160q0 33-23.5 56.5T680-80ZM40-800v-80h131l170 360h280l156-280h91L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68.5-39t-1.5-79l54-98-144-304H40Z"/></svg> */}
					</button>
					
						<div className='dropdown-menu' aria-labelledby="dropdownMenuButton1">
							{store.cart.length === 0 ? <li className="dropdown-item empty-cart-message">Your cart is empty</li>
								: (
									<ul className='cart-items'>
										{store.cart.map((meal, id) => {
											return <li className="dropdown-item cart-item" key={id}>
												<div className="cart-item-details">
													<p className='cart-name'>{meal.name}{meal.category}</p>
													<div className="cart-item-summary">
														<span className='quantity'>x {meal.quantity}</span>
														<span className='price'>${meal.price.toFixed(2)}</span>
													</div>


												</div>
												{/* <div className="cart-item-actions">
													<button className="btn" onClick={(e) => actions.removeFromCart(meal.id)}>−</button>
													<button className="btn" onClick={(e) => actions.addToCart(meal)}>+</button>
												</div> */}

											</li>

										})}
										<li className="dropdown-item total-amount">
											<span>Total:</span>
											<span>${totalAmount.toFixed(2)}</span>
										</li>
										<li className="dropdown-item cart-actions">
											<button className="butt-close" onClick={onClose}>Close</button>
											<Link to = {`/restaurants/${restaurantId}/tables/${tableId}/order-summary`}>
												<button className="butt-order">Order</button>
											</Link>
										</li>
									</ul>)}
						</div>



					
				</div>



			</header>
			<div className='main-image'>
				<img src={store.restaurant.image} />
			</div>
		</>

	);
};