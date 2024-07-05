import React, { useState, useEffect, useContext } from 'react';
import "../../styles/mesas.css";
import iconoMesas from "../../img/icono-mesa.png";
import iconoCanto from "../../img/barraCantoTransp.png";
import iconoBarra from "../../img/barraVertTransp.png";
import suelo from "../../img/suelo506.png";
import { Context } from '../store/appContext';

const Mesas = () => {
    const [mesas, setMesas] = useState([]);
    const [tempMesas, setTempMesas] = useState([]);
    const [angulosRotacion, setAngulosRotacion] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [nombreSalon, setNombreSalon] = useState('Salón 1');
    const [largoSala, setLargoSala] = useState(10);
    const [anchoSala, setAnchoSala] = useState(15);
    const [tempLargoSala, setTempLargoSala] = useState(10);
    const [tempAnchoSala, setTempAnchoSala] = useState(15);
    const { store, actions } = useContext(Context);

    useEffect(() => {
        const savedLargoSala = localStorage.getItem('largoSala');
        const savedAnchoSala = localStorage.getItem('anchoSala');
        const savedAngulosRotacion = localStorage.getItem('angulosRotacion');
        if (savedLargoSala) setLargoSala(JSON.parse(savedLargoSala));
        if (savedAnchoSala) setAnchoSala(JSON.parse(savedAnchoSala));
        if (savedAngulosRotacion) setAngulosRotacion(JSON.parse(savedAngulosRotacion));
        setTempLargoSala(savedLargoSala ? JSON.parse(savedLargoSala) : 10);
        setTempAnchoSala(savedAnchoSala ? JSON.parse(savedAnchoSala) : 15);
    }, []);

    const girarMesa = (idMesa) => {
        setAngulosRotacion((prevAngulos) => {
            const anguloActual = prevAngulos[idMesa] || 0;
            const nuevoAngulo = anguloActual + 90;
            return { ...prevAngulos, [idMesa]: nuevoAngulo % 360 };
        });
    };

    const agregarMesa = (icon) => {
        console.log(tempMesas);
        const maxId = tempMesas.reduce((max, mesa) => Math.max(max, mesa.id), 0);
        console.log(maxId);
        const nuevaMesa = {
            id: maxId + 1,
            table_number: `${maxId + 1}`,
            position_x: 0,
            position_y: 10,
            icon: icon,
        };
        setTempMesas([...tempMesas, nuevaMesa]);
    };

    const manejarSoltar = (e) => {
        e.preventDefault();
        const contenedor = e.target.getBoundingClientRect();
        const id = e.dataTransfer.getData("text/plain");
        const ajusteX = 26;
        const ajusteY = 26;
        const nuevaPosicion = {
            x: e.clientX - contenedor.left - ajusteX,
            y: e.clientY - contenedor.top - ajusteY
        };
        moverMesa(parseInt(id), nuevaPosicion);
    };

    const actualizarNombreMesa = (id, nuevoNombre) => {
        setTempMesas(tempMesas.map(mesa => mesa.id === id ? { ...mesa, table_number: nuevoNombre } : mesa));
    };

    const moverMesa = (id, nuevaPosicion) => {
        setTempMesas(tempMesas.map(mesa => mesa.id === id ? { ...mesa, position_x: nuevaPosicion.x, position_y: nuevaPosicion.y } : mesa));
    };

    const iniciarArrastre = (e, id) => {
        e.dataTransfer.setData("text/plain", id);
        e.dataTransfer.setDragImage(e.target, 25, 25);
    };

    function finalizarArrastre(e) {
        e.target.style.zIndex = '';
    }

    const permitirSoltar = (e) => {
        e.preventDefault();
    };

    const actualizarTamañoSala = (ancho, largo) => {
        const proporcion = 55;
        const nuevoAncho = ancho * proporcion;
        const nuevoAlto = largo * proporcion;
        const divSala = document.querySelector('.sala');
        if (divSala) {
            divSala.style.width = `${nuevoAncho}px`;
            divSala.style.height = `${nuevoAlto}px`;
        }
    };

    const eliminarMesa = (table_number) => {
        setTempMesas(tempMesas.filter(mesa => mesa.table_number !== table_number));
    };

    useEffect(() => {
        actualizarTamañoSala(tempAnchoSala, tempLargoSala);
    }, [tempLargoSala, tempAnchoSala]);

    const fetchTables = async () => {
        const tables = await actions.getTableList();
        setMesas(tables);
        setTempMesas(tables);
    };

    useEffect(() => {
        fetchTables();
    }, []);

    const guardarCambios = async () => {
        try {
            await Promise.all(tempMesas.map(async (mesa) => {
                const existingTable = mesas.find(m => m.id === mesa.id);
                if (existingTable) {
                    if (existingTable.position_x !== mesa.position_x || existingTable.position_y !== mesa.position_y) {
                        await actions.updateTablePosition(mesa.table_number, { x: mesa.position_x, y: mesa.position_y });
                    }
                    if (existingTable.table_number !== mesa.table_number) {
                        await actions.updateTableNumber(mesa.id, mesa.table_number);
                    }
                } else {
                    await actions.createNewTable(mesa);
                }
            }));

            const mesasToDelete = mesas.filter(mesa => !tempMesas.find(tm => tm.id === mesa.id));
            await Promise.all(mesasToDelete.map(async (mesa) => {
                await actions.delete_table(mesa.table_number);
            }));

            setMesas(tempMesas);

            setLargoSala(tempLargoSala);
            setAnchoSala(tempAnchoSala);

            localStorage.setItem('largoSala', JSON.stringify(tempLargoSala));
            localStorage.setItem('anchoSala', JSON.stringify(tempAnchoSala));
            localStorage.setItem('angulosRotacion', JSON.stringify(angulosRotacion));

            alert("Changes saved successfully!");
        } catch (error) {
            console.error("Error saving changes", error);
            alert("Error saving changes. Please try again.");
        }
    };

    const getIcon = (icon) => {
        switch (icon) {
            case "/icono-mesa.png":
                return "/icono-mesa.png";
            case "/barraVertTransp.png":
                return "/barraVertTransp.png";
            case "/barraCantoTransp.png":
                return "/barraCantoTransp.png";
            default:
                return icon ? icon : iconoMesas;
        }
    };

    return (
        <section>
            <h1 className='section-mesas-tittle'>Tables</h1>
            <div className='principal'>
                <div className='container-mesas1'>
                    <h3>Add Tables</h3>
                    <img src={iconoMesas} alt="Agregar Mesa" onClick={() => agregarMesa(iconoMesas)} style={{ cursor: 'pointer', width: '50px', height: '50px' }} />
                    <img src={iconoBarra} alt="Agregar Mesa" onClick={() => agregarMesa(iconoBarra)} style={{ cursor: 'pointer', width: '50px', height: '50px' }} />
                    <img src={iconoCanto} alt="Agregar Mesa" onClick={() => agregarMesa(iconoCanto)} style={{ cursor: 'pointer', width: '50px', height: '50px' }} />
                    <button className='editar' onClick={() => setModoEdicion(!modoEdicion)}>Edit elements</button>
                </div>
                <div className='top-bottom-container'>
                    <h3>{nombreSalon}</h3>
                    <div
                        className="sala container-mesas"
                        style={{ width: `${anchoSala * 55}px`, height: `${largoSala * 55}px`, position: 'relative', border: '1px solid black', backgroundImage: `url(${suelo})`, backgroundSize: '110px', backgroundPosition: 'center' }}
                        onDragOver={permitirSoltar}
                        onDrop={manejarSoltar}
                    >
                        {tempMesas.map((mesa) => (
                            <div
                                key={mesa.id}
                                draggable={!modoEdicion}
                                onDragStart={(e) => iniciarArrastre(e, mesa.id)}
                                onDragEnd={finalizarArrastre}
                                style={{
                                    cursor: 'grab',
                                    color: 'white',
                                    position: 'absolute',
                                    left: mesa.position_x,
                                    top: mesa.position_y,
                                    zIndex: parseInt(mesa.table_number.toString().replace(/\D/g, '')) || 1
                                }}
                                className="mesa-container"
                            >
                                <img
                                    src={getIcon(mesa.icon)}
                                    alt="Mesa"
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        transform: `rotate(${angulosRotacion[mesa.id] || 0}deg)`,
                                        transition: 'transform 0.3s ease-in-out'
                                    }}
                                />
                                <input
                                    className='input-nombre-mesa'
                                    type="text"
                                    value={mesa.table_number}
                                    onChange={(e) => actualizarNombreMesa(mesa.id, e.target.value)}
                                    disabled={!modoEdicion}
                                />
                                {modoEdicion && (
                                    <>
                                        <button className='eliminar-mesa' onClick={() => eliminarMesa(mesa.table_number)} style={{ position: 'absolute', transform: 'translateX(-50%)', backgroundColor: 'red', color: 'white' }}>X</button>
                                        <button className='girar-mesa' onClick={() => girarMesa(mesa.id)} style={{ position: 'absolute', transform: 'translateX(-50%)', bottom: '-20px' }}>⭮</button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className='container-mesas'>
                    <h3>Edit<br />Room</h3>
                    <div className='sala-container'>
                        <p className='titulos'>Name<br /> of Room</p>
                        <input className='nombre-sala' type="text" value={nombreSalon} onChange={(e) => setNombreSalon(e.target.value)} placeholder="Nombre" />
                    </div>
                    <h3>Size</h3>
                    <div className='sala-container'>
                        <p className='titulos'>Height</p>
                        <input
                            type="number"
                            className='nombre-sala'
                            value={tempLargoSala}
                            onChange={(e) => {
                                setTempLargoSala(e.target.value);
                            }}
                            placeholder="Largo"
                        />
                        <p className='titulos'>Width</p>
                        <input
                            type="number"
                            className='nombre-sala'
                            value={tempAnchoSala}
                            onChange={(e) => {
                                setTempAnchoSala(e.target.value);
                            }}
                            placeholder="Ancho"
                        />
                        <button className='guardar' onClick={guardarCambios}>Save</button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Mesas;








