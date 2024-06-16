import React, { useState, useEffect } from 'react';
import "../../styles/mesas.css";
import iconoMesas from "../../img/icono-mesa.png";
import iconoCanto from "../../img/barraCantoTransp.png";
import iconoBarra from "../../img/barraVertTransp.png";

const Mesas = () => {
    const [mesas, setMesas] = useState([]);
    const [angulosRotacion, setAngulosRotacion] = useState({});
    const [salones, setSalones] = useState([{ id: 1, nombre: 'Salón 1' }]);
    const [numeroDeCopias, setNumeroDeCopias] = useState(1); // Estado para manejar el número de copias del div principal

    const agregarCopia = () => {
        setNumeroDeCopias(numeroDeCopias + 1); // Incrementa el número de copias
    };

    const girarMesa = (idMesa) => {
        // Actualizar el ángulo de rotación de la mesa específica
        setAngulosRotacion((prevAngulos) => {
            const anguloActual = prevAngulos[idMesa] || 0;
            const nuevoAngulo = anguloActual + 90;
            // Si el ángulo es 360, lo reseteamos a 0
            if (nuevoAngulo >= 360) {
                return { ...prevAngulos, [idMesa]: 0 };
            }
            return { ...prevAngulos, [idMesa]: nuevoAngulo };
        });
    };

    const agregarMesa = (icono) => {
        const maxId = mesas.reduce((max, mesa) => Math.max(max, mesa.id), 0);
        const nuevaMesa = {
            id: maxId + 1,
            nombre: `Mesa ${maxId + 1}`,
            posicion: { x: 0, y: 10 },
            icono: icono, // Agrega la propiedad icono a la nueva mesa
        };
        setMesas([...mesas, nuevaMesa]);
    };

    const moverMesa = (id, nuevaPosicion) => {
        setMesas(mesas.map(mesa => {
            if (mesa.id === id) {
                return { ...mesa, posicion: nuevaPosicion };
            }
            return mesa;
        }));
    };

    const iniciarArrastre = (e, id) => {
        e.dataTransfer.setData("text/plain", id);
        e.dataTransfer.setDragImage(e.target, 25, 25);
    };

    function finalizarArrastre(e) {
        e.target.style.zIndex = ''; // Restablecer el z-index
    }

    const permitirSoltar = (e) => {
        e.preventDefault();
    };

    const [modoEdicion, setModoEdicion] = useState(false);

    const [nombreSalon, setNombreSalon] = useState('Salón 1');
    const [largoSala, setLargoSala] = useState(10); // Largo de la sala en metros
    const [anchoSala, setAnchoSala] = useState(15); // Ancho de la sala en metros
    const agregarSalon = () => {
        const nuevoId = salones.length + 1;
        const nuevoSalon = { id: nuevoId, nombre: `Salón ${nuevoId}` };
        setSalones([...salones, nuevoSalon]);
    };

    const [tempLargoSala, setTempLargoSala] = useState('10');
    const [tempAnchoSala, setTempAnchoSala] = useState('15');

    // Función para actualizar el tamaño de la sala basado en los inputs
    const actualizarTamañoSala = () => {
        const proporcion = 55; // 1 metro = 100 píxeles, ajusta según tu diseño
        const nuevoAncho = anchoSala * proporcion; // Nuevo ancho en píxeles
        const nuevoAlto = largoSala * proporcion; // Nuevo alto en píxeles

        // Actualiza el estilo del div de la sala
        const divSala = document.querySelector('.sala');
        if (divSala) {
            divSala.style.width = `${nuevoAncho}px`;
            divSala.style.height = `${nuevoAlto}px`;
        }
    };

    const eliminarMesa = (id) => {
        setMesas(mesas.filter(mesa => mesa.id !== id));
    };

    const manejarSoltar = (e) => {
        e.preventDefault();
        const contenedor = e.target.getBoundingClientRect();
        const id = e.dataTransfer.getData("text/plain");
        // Ajuste para centrar el icono en la posición del cursor
        const ajusteX = 51; // La mitad del ancho del icono
        const ajusteY = 39; // La mitad del alto del icono
        const nuevaPosicion = {
            x: e.clientX - contenedor.left - ajusteX,
            y: e.clientY - contenedor.top - ajusteY
        };
        moverMesa(parseInt(id), nuevaPosicion);
    };

    const actualizarNombreMesa = (id, nuevoNombre) => {
        setMesas(mesasPrevias => mesasPrevias.map(mesa =>
            mesa.id === id ? { ...mesa, nombre: nuevoNombre } : mesa
        ));
    };

    useEffect(() => {
        if (tempLargoSala != null && tempAnchoSala != null) {
            setLargoSala(tempLargoSala);
            setAnchoSala(tempAnchoSala);
        }
    }, [tempLargoSala, tempAnchoSala]);

    useEffect(() => {
        // Asegúrate de que este efecto se ejecute solo después de que largoSala y anchoSala se hayan actualizado.
        // Esto es útil si actualizarTamañoSala depende de los valores actualizados de largoSala y anchoSala.
        actualizarTamañoSala();
    }, [largoSala, anchoSala]);

    return (
        <>
            {[...Array(numeroDeCopias)].map((_, index) => (
                <section key={index}>
                    <div className='principal'>
                        <div className='container-mesas1'>
                            <h3>Agregar Mesa</h3>
                            <img src={iconoMesas} alt="Agregar Mesa" onClick={() => agregarMesa(iconoMesas)} style={{ cursor: 'pointer', width: '50px', height: '50px' }} />
                            <img src={iconoBarra} alt="Agregar Mesa" onClick={() => agregarMesa(iconoBarra)} style={{ cursor: 'pointer', width: '50px', height: '50px' }} />
                            <img src={iconoCanto} alt="Agregar Mesa" onClick={() => agregarMesa(iconoCanto)} style={{ cursor: 'pointer', width: '50px', height: '50px' }} />
                            <button className='editar' onClick={() => setModoEdicion(!modoEdicion)}>Editar elementos</button>
                        </div>
                        <div className='top-bottom-container'>
                            <h3>{nombreSalon}</h3>
                            <div
                                className="sala container-mesas"
                                style={{ width: '1080px', height: '600px', position: 'relative', border: '1px solid black' }}
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
                                            left: mesa.posicion.x,
                                            top: mesa.posicion.y,
                                            zIndex: parseInt(mesa.nombre.replace(/\D/g, '')) || 1
                                        }}
                                        className="mesa-container"
                                    >
                                        <img
                                            src={mesa.icono}
                                            alt="Mesa"
                                            style={{
                                                width: '50px',
                                                height: '50px',
                                                transform: `rotate(${angulosRotacion[mesa.id] || 0}deg)`, // Aplicar la rotación
                                                transition: 'transform 0.3s ease-in-out' // Añadir una transición suave
                                            }}
                                        />
                                        {modoEdicion ? (
                                            <>
                                                <input
                                                    className='input-nombre-mesa'
                                                    type="text"
                                                    defaultValue={mesa.nombre}
                                                    onBlur={(e) => actualizarNombreMesa(mesa.id, e.target.value)}
                                                />
                                                <button className='eliminar-mesa' onClick={() => eliminarMesa(mesa.id)} style={{ position: 'absolute', transform: 'translateX(-50%)', backgroundColor: 'red', color: 'white' }}>X</button>
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
                            <h3>Editar<br />Salón</h3>
                            <div className='sala-container'>
                                <p className='titulos'>Nombre<br /> del salón</p>
                                <input className='nombre-sala' type="text" value={nombreSalon} onChange={(e) => setNombreSalon(e.target.value)} placeholder="Nombre" />
                            </div>
                            <h3>Tamaño</h3>
                            <div className='sala-container'>
                                <p className='titulos'>Largo m</p>
                                <input
                                    type="number"
                                    className='nombre-sala'
                                    value={tempLargoSala} // Cambiado a tempLargoSala
                                    onChange={(e) => {
                                        setTempLargoSala(e.target.value); // Actualiza tempLargoSala
                                        e.target.focus();
                                    }}
                                    placeholder="Largo"
                                />
                                <p className='titulos'>Ancho m</p>
                                <input
                                    type="number"
                                    className='nombre-sala'
                                    value={tempAnchoSala} // Cambiado a tempAnchoSala
                                    onChange={(e) => {
                                        setTempAnchoSala(e.target.value); // Actualiza tempAnchoSala
                                        e.target.focus();
                                    }}
                                    placeholder="Ancho"
                                />
                                <button onClick={agregarCopia}>Agregar Copia del Salón</button>
                                <button onClick={agregarSalon}>Añadir Salón</button>
                                <button className='editar'>Guardar</button>
                            </div>
                        </div>
                    </div>
                </section>
            ))}
        </>
    );
};

export default Mesas;


// {modoEliminacion && <button className='eliminar-mesa' onClick={() => eliminarMesa(mesa.id)} style={{position: 'absolute', transform: 'translateX(-50%)', backgroundColor: 'red', color: 'white'}}>X</button>}
