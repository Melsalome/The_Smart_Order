import deleteProductDispatcher from "./dispatcherDeleteProduct";
import loginDispatcher from "./dispatcherLogin";
import newProductDispatcher from "./dispatcherNewProduct";
import productDispatcher from "./dispatcherProduct";
import dispatcherProduct from "./dispatcherProduct";

import signupDispatcher from "./dispatcherSignup";


const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
            product:[],
			token: null,
			register: null,
			menu: [],
            cart: [],
            totalAmount: 0
		},
		actions: {
		
			
            getTokenLogin: async (email, password) => {
                const {access_token} = await loginDispatcher(email, password);
                if (access_token) {
                    localStorage.setItem("token", access_token);
                    setStore({ token: access_token })}},
			
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
				setStore({...store, token: null})
			},
			
			getUserRegister: async(restaurantName,firstName, LastName,email, password) => {
				const data = await signupDispatcher(restaurantName,firstName, LastName, email,password);
				console.log(data)
				return data;

			},

			getMenu: (restaurantId,tableId) => {
                const store = getStore()
                fetch(`https://humble-pancake-977xqppgr6q427j55-3001.app.github.dev/api/restaurants/${restaurantId}/tables/${tableId}/menu`)
                    .then(response => response.json())
                    .then(data => {
                        setStore({ ...store, menu: data });
                    })
                    .catch(error => console.error('Error fetching menu:', error));
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

            getProduct: async() => {
              const data = await productDispatcher.get();
            //   console.log(data)
                const store = getStore();
                
              return data;
            
            }, 

            getProductById: async (id) => {
                const data = await productDispatcher.getById(id)
                // console.log(data)
                return data;
            },

            uptadeProductById: async(id, name, price, description, image, category) => {
                const data = await productDispatcher.put(id, name, price, description, image, category)
                return data;
            },

            createNewProduct: async (name, price, description, image, category) => {
                const data = await newProductDispatcher(name, price, description, image, category)
                return data;
            },

            deleteProduct: async(id) => {
                const data = await deleteProductDispatcher(id);
                return data;
            }
		
		}
	};
};

export default getState;
