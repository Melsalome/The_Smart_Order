import React, { useState, useEffect, useContext } from 'react';
import "../../styles/mesas.css";
import iconoMesas from "../../img/icono-mesa.png";
import iconoCanto from "../../img/barraCantoTransp.png";
import iconoBarra from "../../img/barraVertTransp.png";
import suelo from "../../img/suelo506.png";
import { Context } from '../store/appContext';

const Mesas = () => {
    const [mesas, setMesas] = useState([]);
    const [angulosRotacion, setAngulosRotacion] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [nombreSalon, setNombreSalon] = useState('Salón 1');
    const [largoSala, setLargoSala] = useState(10);
    const [anchoSala, setAnchoSala] = useState(15);
    const [tempLargoSala, setTempLargoSala] = useState('10');
    const [tempAnchoSala, setTempAnchoSala] = useState('15');
    const {store, actions} = useContext(Context)


    const girarMesa = (idMesa) => {
        setAngulosRotacion((prevAngulos) => {
            const anguloActual = prevAngulos[idMesa] || 0;
            const nuevoAngulo = anguloActual + 90;
            if (nuevoAngulo >= 360) {
                return { ...prevAngulos, [idMesa]: 0 };
            }
            return { ...prevAngulos, [idMesa]: nuevoAngulo };
        });
    };


    const agregarMesa = async(icon) => {
        const maxId = mesas.reduce((max, mesa) => Math.max(max, mesa.id), 0);

        const nuevaMesa = {
            id: maxId + 1,
            table_number: `${maxId + 1}`,
            position_x: 0,
            position_y: 10,
            icon: icon,
        };
        await actions.createNewTable(nuevaMesa)
        setMesas([...mesas, nuevaMesa]);
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

    const actualizarNombreMesa = async(id, nuevoNombre) => {
       await actions.updateTableNumber(id, nuevoNombre)
    };

    const moverMesa = async (id, nuevaPosicion) => {
        console.log(mesas)
        const mesa = mesas.find(mesa => mesa.id === id);
        console.log(mesa.id)
        if (mesa) {
            const response = await actions.updateTablePosition(mesa.table_number, nuevaPosicion);
            if (response) {
                setMesas(mesas.map(mesa => mesa.id === id ? { ...mesa, position_x: nuevaPosicion.x, position_y: nuevaPosicion.y } : mesa));
            }
        }
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

    const actualizarTamañoSala = () => {
        const proporcion = 55;
        const nuevoAncho = anchoSala * proporcion;
        const nuevoAlto = largoSala * proporcion;
        const divSala = document.querySelector('.sala');
        if (divSala) {
            divSala.style.width = `${nuevoAncho}px`;
            divSala.style.height = `${nuevoAlto}px`;
        }
    };

    const eliminarMesa = async(table_number) => {
        await actions.delete_table(table_number)
        setMesas(mesas.filter(mesa => mesa.table_number !== table_number))
    };


    useEffect(() => {
        if (tempLargoSala != null && tempAnchoSala != null) {
            setLargoSala(tempLargoSala);
            setAnchoSala(tempAnchoSala);
        }
    }, [tempLargoSala, tempAnchoSala]);

    useEffect(() => {
        actualizarTamañoSala();
    }, [largoSala, anchoSala]);

    useEffect(() => {
        localStorage.setItem('largoSala', JSON.stringify(largoSala));
        localStorage.setItem('anchoSala', JSON.stringify(anchoSala));
        localStorage.setItem('angulosRotacion', JSON.stringify(angulosRotacion));
    }, [largoSala, anchoSala, angulosRotacion]);

    const fetchTables = async () => {
        const tables = await actions.getTableList();
        console.log(tables)
        setMesas(tables);

      };

    useEffect(() => {
        console.log(actions.getTableList())
      fetchTables();
    }, []);

    const getIcon = (icon) => {

        switch(icon) {
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
        <>

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
                            style={{ width: '1080px', height: '600px', position: 'relative', border: '1px solid black', backgroundImage: `url(${suelo})`, backgroundSize: '110px', backgroundPosition: 'center' }}
                            onDragOver={permitirSoltar}
                            onDrop={manejarSoltar}
                        >
                            {mesas.map((mesa) => (
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
                                    {modoEdicion ? (
                                        <>
                                            <input
                                                className='input-nombre-mesa'
                                                type="text"
                                                defaultValue={mesa.table_number}
                                                onBlur={(e) => actualizarNombreMesa(mesa.id, e.target.value)}
                                            />
                                            <button className='eliminar-mesa' onClick={() => eliminarMesa(mesa.table_number)} style={{ position: 'absolute', transform: 'translateX(-50%)', backgroundColor: 'red', color: 'white' }}>X</button>
                                            <button className='girar-mesa' onClick={() => girarMesa(mesa.id)} style={{ position: 'absolute', transform: 'translateX(-50%)', bottom: '-20px' }}>⭮</button>
                                        </>
                                    ) : (
                                        <div className='numeroMesa'>{mesa.nombre}</div>
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
                                    e.target.focus();
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
                                    e.target.focus();
                                }}
                                placeholder="Ancho"
                            />
                            <button className='guardar' onClick={ () =>{fetchTables(); alert("Tables saved succesfully!")}}>Save</button>
                        </div>
                    </div>
                </div>

            </section>
        </>
    );
};

export default Mesas;
