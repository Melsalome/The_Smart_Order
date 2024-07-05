
import { IoRestaurantSharp } from "react-icons/io5";

import deleteProductDispatcher from "./dispatcherDeleteProduct";

import loginDispatcher from "./dispatcherLogin";

import newProductDispatcher from "./dispatcherNewProduct";
import productDispatcher from "./dispatcherProduct";
// import dispatcherProduct from "./dispatcherProduct";
import { dispatcherOrder } from "./dispatcherOrder";


import signupDispatcher from "./dispatcherSignup";

import { dispatcherInvoice } from "./dispatcherInvoice";


import dispatcherTable from "./dispatcherTable";
import sesionsDispatcher from "./dispatcherSesions";


const getState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            product: [],
            token: null,
            register: null,
            menu: [],
            cart: [],
            restaurant: [],
            totalAmount: 0,
            orders: [],
            invoices: [],
            tableList: []
        },
        actions: {


            getTokenLogin: async (email, password) => {
                try {
                    const { access_token } = await loginDispatcher(email, password);
                    if (access_token) {
                        localStorage.setItem("token", access_token);
                        setStore({ token: access_token });
                    }
                } catch (error) {
                    console.error("Error during login:", error);
                    throw new Error("Error during login");
                }
            },

            syncTokenLocalStorage: () => {
                const token = localStorage.getItem("token");
                if (token) {
                    setStore({ token: token });
                }
            },

            handleLogOut: () => {
                localStorage.removeItem("token")
                console.log("Loging out")
                const store = setStore()
                setStore({ ...store, token: null })
            },

            getUserRegister: async (restaurantName, firstName, LastName, email, password) => {
                const data = await signupDispatcher(restaurantName, firstName, LastName, email, password);
                console.log(data)
                return data;

            },

            getMenu: () => {
                const store = getStore()
                fetch(`${process.env.BACKEND_URL}/app/products`)
                    .then(response => response.json())
                    .then(data => {
                        setStore({ ...store, menu: data });

                    })
                    .catch(error => console.error('Error fetching menu:', error));
            },

            createOrder: async (restaurantId, tableId, comment, paymentMethod, totalPrice) => {
                const store = getStore()
                const orderData = {
                    restaurant_id: restaurantId,
                    table_id: tableId,
                    comment: comment,
                    payment_method: paymentMethod,
                    total_price: totalPrice,
                    items: store.cart.map(meal => ({
                        menu_id: meal.id,
                        name: meal.name,
                        quantity: meal.quantity,
                        price: meal.price,
                    })),
                    created_at: new Date().toISOString()
                };

                try {
                    const responseSession = await fetch(`${process.env.BACKEND_URL}/app/sessions/${tableId}/products`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            CORS: 'Access-Control-Allow-Origin',
                            body: JSON.stringify(orderData)
                        });

                    if (!response.ok) {
                        throw new Error('Failed to create session');
                    }

                    const result = await response.json();
                    setStore({ ...store, orders: [...store.orders, result] });
                    console.log('Order created successfully2:', result);
                    return responseSession;
                } catch (error) {
                    console.error('Error:', error);
                    // alert('Error creating order. Please try again.');
                }


                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/app/restaurants/${restaurantId}/tables/${tableId}/orders`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        CORS: 'Access-Control-Allow-Origin',
                        body: JSON.stringify(orderData)
                    });

                    if (!response.ok) {
                        throw new Error('Failed to create order');
                    }

                    const result = await response.json();
                    setStore({ ...store, orders: [...store.orders, result] });
                    console.log('Order created successfully:', result);
                    return result;
                }
                catch (error) {

                    console.error('Error:', error);
                    // alert('Error creating order. Please try again.');
                }
            },


            getOrder: async (restaurantId) => {
                const data = await dispatcherOrder.get(restaurantId);
                const store = getStore();
                const ordersWithTimestamp = store.orders.map(order => ({
                    ...order,
                    timestamp: new Date().toISOString()
                }));

                setStore({ orders: ordersWithTimestamp });
                setStore({ ...store, orders: data });
                console.log(data);
            },


            updateOrder: async (restaurantId, tableId, orderId, updatedOrderData) => {
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/app/restaurants/${restaurantId}/tables/${tableId}/orders/${orderId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        CORS: 'Access-Control-Allow-Origin',
                        body: JSON.stringify(updatedOrderData)
                    });

                    if (!response.ok) {
                        throw new Error('Failed to update order');
                    }

                    const result = await response.json();
                    const store = getStore();
                    const updatedOrders = store.orders.map(order => order.id === orderId ? result : order);
                    setStore({ ...store, orders: updatedOrders });
                    console.log('Order updated successfully:', result);
                } catch (error) {
                    console.error('Error:', error);
                }
            },

            deleteOrder: async (restaurantId, tableId, orderId) => {
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/app/restaurants/${restaurantId}/tables/${tableId}/orders/${orderId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        CORS: 'Access-Control-Allow-Origin',
                    });

                    if (!response.ok) {
                        throw new Error('Failed to delete order');
                    }

                    const store = getStore();
                    const updatedOrders = store.orders.filter(order => order.id !== orderId);
                    setStore({ ...store, orders: updatedOrders });
                    console.log('Order deleted successfully');
                } catch (error) {
                    console.error('Error:', error);
                }
            },

            removeOrderFromList: (orderId) => {
                const store = getStore();
                const updatedOrders = store.orders.filter(order => order.id !== orderId);
                setStore({ ...store, orders: updatedOrders });
            },

            addToCart: (meal, quantity = 1) => {
                const store = getStore()
                const existingItemIndex = store.cart.findIndex(item => item.id === meal.id);

                if (existingItemIndex !== -1) {
                    const updatedCart = [...store.cart];
                    updatedCart[existingItemIndex].quantity += quantity;
                    setStore({ ...store, cart: updatedCart });
                    console.log(store.cart)
                } else {
                    const updatedCart = [...store.cart, { ...meal, quantity }];
                    setStore({ ...store, cart: updatedCart });
                    console.log(store.cart)
                }

                const updatedTotalAmount = store.totalAmount + (meal.price) * quantity;
                setStore({ ...store, totalAmount: updatedTotalAmount });
            },

            removeFromCart: (mealId) => {
                const store = getStore();
                const updatedCart = store.cart.map(meal => {
                    if (meal.id === mealId) {
                        if (meal.quantity > 1) {
                            return { ...meal, quantity: meal.quantity - 1 };
                        } else {
                            return null;
                        }
                    } else {
                        return meal;
                    }
                }).filter(meal => meal !== null);

                const mealToRemove = store.cart.find(meal => meal.id === mealId);
                const updatedTotalAmount = store.totalAmount - mealToRemove.price;

                setStore({ ...store, cart: updatedCart, totalAmount: updatedTotalAmount });
            },

            removeItem: (mealId) => {
                const store = getStore();
                const updatedCart = store.cart.filter(meal => meal.id !== mealId);

                setStore({ ...store, cart: updatedCart });

            },

            clearCart: () => {
                const store = getStore();
                setStore({ ...store, cart: [], totalAmount: 0 });
            },


            getRestaurant: (restaurantId) => {
                const store = getStore()
                fetch(`${process.env.BACKEND_URL}/app/restaurants/${restaurantId}`)
                    .then(response => response.json())
                    .then(data => {
                        setStore({ ...store, restaurant: data });
                    })
                    .catch(error => console.error('Error fetching menu:', error))
            },

            getProduct: async () => {
                const data = await productDispatcher.get();
                return data
            },

            getProductById: async (id) => {
                const data = await productDispatcher.getById(id)
                return data;
            },

            updateProductById: async (id, name, price, description, image, category) => {
                const data = await productDispatcher.put(id, name, price, description, image, category)
                return data;
            },

            createNewProduct: async (name, price, description, image, category) => {
                const data = await newProductDispatcher(name, price, description, image, category)
                return data;
            },

            deleteProduct: async (id) => {
                const data = await deleteProductDispatcher(id);
                return data;
            },

            createInvoice: async (restaurantId, tableId, orderId) => {
                const store = getStore()
                const invoiceData = {
                    order_id: orderId
                };

                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/app/restaurants/${restaurantId}/tables/${tableId}/invoices`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        CORS: 'Access-Control-Allow-Origin',
                        body: JSON.stringify(invoiceData)
                    });

                    if (!response.ok) {
                        throw new Error('Failed to create invoice');
                    }

                    const result = await response.json();
                    setStore({ ...store, invoices: [...store.invoices, result] });
                    console.log('Invoice created successfully:', result);
                } catch (error) {
                    console.error('Error:', error);
                    // alert('Error creating order. Please try again.');
                }
            },
            getInvoice: async (restaurantId, tableId, invoiceId) => {
                const data = await dispatcherInvoice.get(restaurantId, tableId, invoiceId);
                const store = getStore();
                setStore({ ...store, invoices: [...store.invoices, data] });
            },
            addOrder: (newOrder) => {
                const store = getStore();
                setStore({ orders: [...store.orders, newOrder] });
            },
            getOrderById: async (restaurantId, tableId, orderId) => {
                const data = await dispatcherOrder.getOrderById(restaurantId, tableId, orderId)
                return data;
            },
            createNewTable: async (table_number, position_x, position_y, icon) => {
                const data = await dispatcherTable.create_table(table_number, position_x, position_y, icon);
                return data;
            },

            delete_table: async (table_number) => {
                const data = await dispatcherTable.delete_table(table_number)
                return data;
            },

            getTableList: async () => {
                const data = await dispatcherTable.getTableList()
                const store = getStore()
                setStore({ tableList: [...store.tableList, data] })
                return data;
            },

            updateTablePosition: async (table_number, position) => {
                const data = await dispatcherTable.updateTablePosition(table_number, position)
                return data;
            },

            updateTableNumber: async (id, table_number) => {
                const data = await dispatcherTable.updateTableNumber(id, table_number)
                return data;
            },

            createClient: async (name) => {
                const data = await sesionsDispatcher.create_client(name);
                return data;
            },
            assingClient: async (idTable, idClient) => {
                const data = await sesionsDispatcher.assing_client(idTable, idClient);
                console.log(data);

                return data;
            },
            getSessions: async () => {
                const data = await sesionsDispatcher.get();
                return data;
            },
            addProductToTable: async (tableId, items) => {
                const data = await sesionsDispatcher.add_product_to_session(
                    tableId,
                    items
                );
                console.log("dato en flux addProductToTable: ", data);
                return data;
            },

            getActiveSessionTable: async (table_number) => {
                const data = await sesionsDispatcher.get_session_active(table_number);
                console.log("dato en flux getActiveSessionTable", data);
                return data;
            },

            getActiveSessionList: async () => {
                const data = await sesionsDispatcher.getActiveSessions();
                console.log("dato en flux getAllActiveSessions", data);
                return data;
            },
            closeActiveSession: async (table_number) => {
                const data = await sesionsDispatcher.close_session(table_number);
                console.log("dato en flux closeActiveSession", data)
                return data;
            },
            getPendingOrderList: async (restaurantId) => {
                const data = await dispatcherOrder.getPendingOrderList(restaurantId);
                const store = getStore();
                const ordersWithTimestamp = store.orders.map(order => ({
                    ...order,
                    timestamp: new Date().toISOString()
                }));
                setStore({ orders: ordersWithTimestamp });
                setStore({ ...store, orders: data });
                console.log("dato en flux getPendingOrderList", data);
            },

            updateOrderStatus: async (restaurantId, orderId) => {
                const data = await dispatcherOrder.updateOrderStatus(restaurantId, orderId);
                return data;
            },




        }
    }

};










export default getState;
