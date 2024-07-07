import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../../styles/GenerateQR.css";

export const GenerateQR = () => {
    const [restaurantId, setRestaurantId] = useState('1');
    const [tableNumber, setTableNumber] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState(null);
    const [tables, setTables] = useState([]);

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const response = await axios.get(`${process.env.BACKEND_URL}/app/tables`);
                const sortedTables = response.data.sort((a, b) => a.table_number - b.table_number);
                setTables(sortedTables);
            } catch (error) {
                console.error('Error fetching tables', error);
            }
        };

        fetchTables();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch(`${process.env.BACKEND_URL}/app/restaurants/${restaurantId}/tables/${tableNumber}/generate_qr`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setQrCodeUrl(url);
        } catch (error) {
            console.error('Error generating QR code', error);
        }
    };

    return (
        <section className='section-qr'>
            <h1 className='section-mesas-tittle'>QR codes</h1>
            <div className='container-qr'>
                <h1>Generate QR Code</h1>
                <form onSubmit={handleSubmit}>

                    <div className='inputs-qr'>
                        <label className='label-qr'>
                            Table Number:
                            <select
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                required
                            >
                                <option value="">Select a table</option>
                                {tables.map((table) => (
                                    <option key={table.table_number} value={table.table_number}>
                                        {table.table_number}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <button className='btn-qr' type="submit">Generate QR Code</button>
                </form>
                {qrCodeUrl && (
                    <div className='qr-space'>
                        <h2>QR Code:</h2>
                        <img src={qrCodeUrl} alt="QR Code" />
                    </div>
                )}
            </div>
        </section>
    );
};
