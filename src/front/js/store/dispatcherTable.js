import react from 'react'


const dispatcherTable = {
    create_table: async (new_table) => {
        const response = await fetch(`${process.env.BACKEND_URL}/app/tables`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            CORS: 'Access-Control-Allow-Origin',
            body: JSON.stringify({ "table_number": new_table.table_number, "position_x": new_table.position_x, "position_y": new_table.position_y, "icon": new_table.icon })
        })
        console.log(response)
        if (!response.ok) throw Error("table_number is required", 400)

        const data = await response.json()
        console.log("Table creada con éxito", data)

        return data
    },
    delete_table: async (table_number) => {
        const response = await fetch(`${process.env.BACKEND_URL}/app/tables/${table_number}`, {
            method: 'DELETE',
            headers: { "Content-Type": "application/json" },
            CORS: 'Access-Control-Allow-Origin'
        })
        console.log(response)
        if (!response.ok) throw Error("No se ha podido eliminar la mesa")
        const data = await response.json()
        console.log("Mesa eliminada con éxito", data)
        return data;
    },

    getTableList: async () => {
        const response = await fetch(`${process.env.BACKEND_URL}/app/tables`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            CORS: 'Access-Control-Allow-Origin',
        })

        if (!response.ok) throw Error("There are no tables")

        const data = await response.json()
        return data;
    },

    updateTablePosition: async (table_number, position) => {
        const response = await fetch(`${process.env.BACKEND_URL}/app/tables/${table_number}`, {
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
            CORS: 'Access-Control-Allow-Origin',
            body: JSON.stringify({ position_x: position.x, position_y: position.y })
        });
        if (!response.ok) throw Error("Error updating table positions")

        const data = await response.json();
        return data;
    },

    updateTableNumber: async (id, table_number) => {
        const response = await fetch(`${process.env.BACKEND_URL}/app/tables/${id}/update/number`, {
            method: 'PATCH',
            headers: { "Content-Type": "application/json" },
            CORS: 'Access-Control-Allow-Origin',
            body: JSON.stringify({ "table_number": table_number })
        });
        if (!response.ok) throw Error("Error updating table positions")

        const data = await response.json();
        return data;
    },


}


export default dispatcherTable

