import React from "react";

const sesionsDispatcher = {
  assing_client: async (idTable, idClient) => {
    const response = await fetch(`${process.env.BACKEND_URL}/app/tables/${idTable}/${idClient}/client`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      console.log(response)
    );

    if (!response.ok) throw Error("There are no products");

    if (response.status === 401) {
      throw "Invalid credentials";
    } else if (response.status === 400) {
      throw "Invalid email or password format";
    }
    const data = await response.json();
    // console.log(data)
    return data;
  },

  create_client: async (name) => {
    const requestBody = {
      name: name,
    };
    const response = await fetch(`${process.env.BACKEND_URL}/app/client/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      CORS: "Access-Control-Allow-Origin",
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) throw Error("There are no products");

    if (response.status === 401) {
      throw "Invalid credentials";
    } else if (response.status === 400) {
      throw "Invalid email or password format";
    }
    const data = await response.json();
    // console.log(data)
    return data;
  },
  put: async (id, name, price, description, image, category) => {
    const response = await fetch(`${process.env.BACKEND_URL}/app/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        price: price,
        description: description,
        image: image,
        category: category,
      }),
    });

    if (!response.ok) throw Error("There are no products");

    if (response.status === 401) {
      throw "Invalid credentials";
    } else if (response.status === 400) {
      throw "Invalid email or password format";
    }
    const data = await response.json();
    // console.log(data)
    return data;
  },
  getActiveSessions: async () => {
    const response = await fetch(`${process.env.BACKEND_URL}/app/sessions`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return await response.json();
  },
  add_product_to_session: async (tableId, items) => {
    const reqBody = {
      items: items,
    };
    console.log("en dispatcher BODY: ", reqBody);
    const response = await fetch(
      `${process.env.BACKEND_URL}/app/sessions/${tableId}/products`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        CORS: "Access-Control-Allow-Origin",
        body: JSON.stringify(reqBody),
      }
    );
    return await response.json();
  },

  get_session_active: async (table_number) => {
    const response = await fetch(
      `${process.env.BACKEND_URL}/app/sessions/${table_number}/active`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.json();
  },

  close_session: async (table_number) => {
    const requestBody = {
      table_number: table_number,
    };
    const response = await fetch(`${process.env.BACKEND_URL}/app/sessions/${table_number}/close`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    })
    return response.json();
  }
};

export default sesionsDispatcher;
