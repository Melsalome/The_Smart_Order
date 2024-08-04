import React, { useContext, useEffect, useState, useRef } from "react";
import "../../styles/caja.css";
import iconoAtras from "../../img/flecha-hacia-atras.png";
import iconoLlave from "../../img/llave.png";
import iconoPagar from "../../img/pagar.png";
import iconoCard from "../../img/card1.png";
import iconoMoney from "../../img/money1.png";
import suelo from "../../img/suelo506.png";
import { Context } from "../store/appContext";
import Mesa from "../component/Mesa";
import { useNavigate } from "react-router-dom";

const Caja = () => {
    const [largoSala, setLargoSala] = useState('600px');
    const [anchoSala, setAnchoSala] = useState('600px');
    const [mesas, setMesas] = useState([]);
    const [angulosRotacion, setAngulosRotacion] = useState({});
    const [mostrarCarta, setMostrarCarta] = useState(false);
    const [mostrarCalculadora, setMostrarCalculadora] = useState(false);
    const { store, actions } = useContext(Context);
    const [activeSession, setActiveSession] = useState({ id_table: 1, products: [] });
    const [orderList, setOrderList] = useState([])
    const [loading, setLoading] = useState(true);
    const [selectedTable, setSelectedTable] = useState(null);
    const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
    const [productPrices, setProductPrices] = useState([]);
    const [paidAmount, setPaidAmount] = useState(0);
    const totalToPay = activeSession.products.reduce((acc, product) => acc + (product.price * product.quantity), 0);
    const payInputRef = useRef(null);
    const [isSessionClosed, setIsSessionClosed] = useState(false);
    const [tableList, setTableList] = useState([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalInsufficientPaymentVisible, setModalInsufficientPaymentVisible] = useState(false);




    const recuperarEstado = async () => {
        try {

            const largo = JSON.parse(localStorage.getItem('largoSala')) || '600px';
            const ancho = JSON.parse(localStorage.getItem('anchoSala')) || '600px';
            const angulosGuardados = JSON.parse(localStorage.getItem('angulosRotacion')) || {};
            setLargoSala(largo);
            setAnchoSala(ancho);
            setAngulosRotacion(angulosGuardados);
            const data = await actions.getTableList();
            setTableList(data);
            console.log('Datos de la base de datos:', data);
        } catch (error) {
            console.error('Error al recuperar el estado:', error);
        }
    };

    const fetchingOrderList = async (restaurantId) => {

        const data = await actions.getPendingOrderList(restaurantId);
        setOrderList(data);
    }

    const fetchData = async () => {
        console.log(orderList)
        await recuperarEstado();
        await fetchProductPrices();
        await handleActiveSessionList();
        setLoading(false);
        await fetchingOrderList(1);

    };
    useEffect(() => {
        fetchData();

    }, []);

    const abrirModal = () => {
        setModalVisible(true);
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
        setTimeout(() => {
            setMostrarModal(false);
        }, 500);
    };

    const manejarClickAtrasConModal = () => {
        if (totalToPay === 0) {
            return;
        }
        manejarClickAtras();
        abrirModal();
        handleCloseSession(activeSession.table_number);
    };


    const manejarClickAtras = () => {
        setMostrarCarta(false);
        setMostrarCalculadora(false);
        resetPaidAmount();
    };

    const manejarClickPagar = () => {
        setMostrarCalculadora(true);
        setMostrarCarta(false);
        resetPaidAmount();
    };

    const abrirCaja = () => {
        alert("Cash Box Opened!");
    };

    const fetchProductPrices = async () => {
        try {
            const response = await fetch(`${process.env.BACKEND_URL}/app/products`);
            const data = await response.json();
            setProductPrices(data);
        } catch (error) {
            console.error("Error fetching product prices:", error);
        }
    };

    const handlePaidAmountChange = (event) => {
        const value = parseFloat(event.target.value);
        if (!isNaN(value)) {
            setPaidAmount(value);
        } else {
            setPaidAmount(0);
        }
    };

    const resetPaidAmount = () => {
        setPaidAmount(0);
        if (payInputRef.current) {
            payInputRef.current.value = "";
        }
    };

    const change = paidAmount - totalToPay;

    useEffect(() => {
        const aplicarMedidas = () => {
            const contenedorMesas = document.querySelector('.container-caja-mesas');
            if (contenedorMesas) {
                contenedorMesas.style.height = `${largoSala * 55}px`;
                contenedorMesas.style.width = `${anchoSala * 55}px`;
            }
        };
        aplicarMedidas();
    }, [largoSala, anchoSala]);

    const handleActiveSession = async (table_number) => {
        const data = await actions.getActiveSessionTable(table_number);
        if (!data.products || !Array.isArray(data.products)) {
            setActiveSession({ table_number: table_number, products: [], payment_status: 'pending' });
            setIsSessionClosed(false)
            return;
        }

        const productsWithPrices = data.products.map(product => {
            const productDetails = productPrices.find(p => p.id === product.id_product);
            return {
                ...product,
                price: productDetails ? productDetails.price : null
            };
        });

        const groupedProducts = productsWithPrices.reduce((acc, product) => {
            if (!acc[product.id_product]) {
                acc[product.id_product] = { ...product };
            } else {
                acc[product.id_product].quantity += product.quantity;
            }
            return acc;
        }, {});

        const order = orderList.find(order => order.table_id === table_number);
        const payment_status = order ? order.payment_status : 'pending';
        setActiveSession({ table_number: table_number, products: Object.values(groupedProducts), payment_status });

    };


    const handleActiveSessionList = async () => {
        const dataSessionList = await actions.getActiveSessionList();
        setMesas(prevMesas =>
            prevMesas.map((mesa) => {
                const isActive = dataSessionList.some(session => session.status === 'active' && session.table_number === mesa.table_number);
                return { ...mesa, status: isActive ? 'occupied' : 'available' }
            })
        );
        setTableList(prevTableList =>
            prevTableList.map((mesa) => {
                const isActive = dataSessionList.some(session => session.status === 'active' && session.table_number === mesa.table_number);
                return { ...mesa, status: isActive ? 'occupied' : 'available' };
            })
        );
    };

    const handleCloseSession = async (table_number) => {
        const closedSession = await actions.closeActiveSession(table_number);
        console.log(closedSession);
        setIsSessionClosed(true);
        // setActiveSession({ table_number: table_number, products: [] });
        setActiveSession({ table_number: null, products: [] });
        setTableList(prevTableList =>
            prevTableList.map(mesa =>
                mesa.table_number === table_number ? { ...mesa, status: 'available' } : mesa
            ),
        );
        await handleActiveSessionList();
    };

    const handleMesaClick = (id) => {
        setMesaSeleccionada(id);
    };

    const handleDeselect = () => {
        setSelectedTable(null);
        setMesaSeleccionada(null);
    };

    const handleClickOutside = (event) => {
        if (!event.target.closest('.mesa-container')) {
            handleDeselect();
        }
    };

    const handleKeyPress = (key) => {
        if (key === '⌫') {
            payInputRef.current.value = payInputRef.current.value.slice(0, -1);
        } else {
            payInputRef.current.value += key;
        }
        handlePaidAmountChange({ target: { value: payInputRef.current.value } });
    };

    const formattedChange = (change) => {
        if (change < 0 && change > -0.005) {
            return "0.00";
        }
        return change.toFixed(2);
    };

    const manejarClickCash = () => {
        if (totalToPay === 0) {
            return;
        }

        if (paidAmount < totalToPay) {
            setModalInsufficientPaymentVisible(true);
        } else {
            setModalInsufficientPaymentVisible(false);
            abrirModal();
            handleCloseSession(activeSession.table_number);
        }

        if (change >= 0) {
            setMostrarCalculadora(false);
            setMostrarCarta(false);
            handleDeselect();
        } else {
            setMostrarCalculadora(true);
        }
    };


    useEffect(() => {
        const aplicarMedidas = () => {
            const contenedorMesas = document.querySelector('.container-caja-mesas');
            if (contenedorMesas) {
                contenedorMesas.style.height = `${largoSala * 55}px`;
                contenedorMesas.style.width = `${anchoSala * 55}px`;
            }
        };
        aplicarMedidas();
    }, [largoSala, anchoSala]);

    useEffect(() => {
        let temporizador;
        if (mostrarModal) {
            temporizador = setTimeout(() => {
                cerrarModal();
            }, 1200); // TIEMPO MODAL 850
        }
        return () => clearTimeout(temporizador);
    }, [mostrarModal]);


    useEffect(() => {
        const interval = setInterval(() => {
            handleActiveSessionList()
        }, 10000);
        // OJO, ACTUALIZAR TIEMPO DE SESIONES
        return () => clearInterval(interval);
    }, [tableList]);

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (mostrarCalculadora && payInputRef.current) {
            payInputRef.current.focus();
        }
    }, [mostrarCalculadora]);

    useEffect(() => {
        if (change >= 0) {
            setModalInsufficientPaymentVisible(false);
        }
    }, [change]);

    useEffect(() => {
        const handleCloseModal = (event) => {
            if (
                modalInsufficientPaymentVisible &&
                (event.type === 'click' || event.type === 'keydown')
            ) {
                setModalInsufficientPaymentVisible(false);
            }
        };

        document.addEventListener('click', handleCloseModal);
        document.addEventListener('keydown', handleCloseModal);

        return () => {
            document.removeEventListener('click', handleCloseModal);
            document.removeEventListener('keydown', handleCloseModal);
        };
    }, [modalInsufficientPaymentVisible]);

    const updateMesaStatus = (table_number, status) => {
        setMesas(prevMesas =>
            prevMesas.map(mesa =>
                mesa.table_number === table_number ? { ...mesa, status: status } : mesa
            )
        );
    };
    useEffect(() => {
        console.log(activeSession)
    }, [activeSession]);
    return (
        <>
            <section>
                <h1 className='section-mesas-tittle'>Cash</h1>
                <div className="container-ticket">
                    <div className="botones-arriba">
                        <button className="boton-atras" onClick={manejarClickAtras}><img src={iconoAtras} alt="Atrás" style={{ width: '20px', height: '20px' }} /> Back</button>
                    </div>
                    <div className="ticket">
                        <div className="ticket_table">
                            <div className="ticket-view">
                                <h5> Table number: <strong> {activeSession.table_number}</strong></h5>

                                {activeSession.products.length === 0 && !isSessionClosed ? (
                                    <div className="empty-table-message">▶ Empty table ◀</div>

                                ) : (
                                    activeSession.products.map((product, index) => (
                                        <div className="div-product" key={index}>
                                            <div className="product--name">{product.product_name}</div>
                                            <div className="product-qty">{product.quantity}</div>
                                            <div className="product-total"><div className="divisa"> $</div>{(product.price * product.quantity).toFixed(2)}</div>
                                        </div>
                                    ))
                                )}
                                {activeSession.payment_status === 'paid' && (
                                    <div className="payment-success-message">
                                        This table has been paid with card
                                    </div>
                                )}
                            </div>
                            <div className="total--price">
                                <div className="total--price-tittle">Total:</div>
                                <div className="total--price-amount">${totalToPay.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                    {/* <div className="botones">
                        <button onClick={abrirCaja} className="boton-abrir-caja">Open Cash<img src={iconoLlave} alt="Atrás" style={{ width: '35px', height: '35px' }} /></button>
                        <button className="boton-pagar" onClick={manejarClickPagar}>Pay <br /><img src={iconoPagar} alt="Atrás" style={{ width: '35px', height: '35px' }} /></button>
                    </div> */}
                    <div className="botones">
                        <button onClick={abrirCaja} className="boton-abrir-caja">Open Cash<img src={iconoLlave} alt="Atrás" style={{ width: '35px', height: '35px' }} /></button>
                        {activeSession.payment_status === 'paid' ? (
                            <button className="boton-pagar" onClick={() => handleCloseSession(activeSession.table_number)}>Close Table Session</button>
                        ) : (
                            <button className="boton-pagar" onClick={manejarClickPagar}>Pay <br /><img src={iconoPagar} alt="Atrás" style={{ width: '35px', height: '35px' }} /></button>
                        )}
                    </div>

                </div>

                {!mostrarCarta && !mostrarCalculadora ? (
                    <div className="container-caja-mesas" style={{ backgroundImage: `url(${suelo})`, backgroundSize: '110px', backgroundPosition: 'center' }}>
                        <div className="loader" style={{ visibility: loading ? 'visible' : 'hidden' }}><span>Loading tables status</span>
                            <div className="progress"></div>
                        </div>
                        {tableList.map((mesa) => (
                            <Mesa
                                key={mesa.id}
                                mesa={mesa}
                                isSelected={selectedTable === mesa.table_number || mesaSeleccionada === mesa.id}
                                onDeselect={handleDeselect}
                                onClick={() => {
                                    handleActiveSession(mesa.table_number);
                                    handleMesaClick(mesa.id);
                                }}
                                updateMesaStatus={updateMesaStatus}
                                angulo={angulosRotacion[mesa.id]}

                            />
                        ))}
                    </div>
                ) : mostrarCarta ? (
                    <div className="carta-caja">
                        <h1>Carta</h1>
                    </div>
                ) : (
                    <div className="container-calculadora">
                        <div className="calculadora">
                            <div className="calculadora-total">
                                <div className="to-pay">
                                    <h2>To Pay:</h2>
                                    <h3>{activeSession.products.reduce((acc, product) => acc + (product.price * product.quantity), 0).toFixed(2)}</h3>
                                </div>
                                <div className={`to-change ${change < -0.001 ? 'negative' : ''}`}>
                                    <h2>Change:</h2>
                                    <h3>{formattedChange(change)}</h3>
                                </div>
                                <div className="to-paid">
                                    <h2>Paid:</h2>
                                    <div className="dollar-group">
                                        <input className="pay-input" type="text" onChange={handlePaidAmountChange} ref={payInputRef} />
                                    </div>
                                </div>
                                <div className="teclado">
                                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map((key) => (
                                        <button key={key} className="teclado-btn" onClick={() => handleKeyPress(key)}>
                                            {key}
                                        </button>
                                    ))}
                                </div>
                                <div className="botones-pagar">
                                    <button className="boton-cash" onClick={manejarClickCash}>Cash <br /><img src={iconoMoney} alt="Cash" style={{ width: '50px', height: '50px' }} /></button>
                                    <button className="boton-card" onClick={manejarClickAtrasConModal}>Credit Card <br /><img src={iconoCard} alt="Credit Card" style={{ width: '50px', height: '50px' }} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {mostrarModal && (
                    <div className={`modal-cash ${modalVisible ? 'fade-in' : 'fade-out'}`}>
                        <h3>Ticket invoiced.</h3>
                    </div>
                )}
                {modalInsufficientPaymentVisible && (
                    <div className="modal-insufficient-payment">
                        <h3>Insufficient Payment</h3>
                        <p>Please pay the full amount before proceeding.</p>
                    </div>
                )}
            </section>
        </>
    );
};

export default Caja;

