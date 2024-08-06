import React, { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { Navbar } from "../component/navbar";
import { Footer } from "../component/footer";
import { Context } from "../store/appContext";
import "../../styles/menu.css";
import { AddForm } from "../component/AddForm";

const MenuItem = ({ meal }) => (
  <li className="meal">
    <img src={meal.image} alt={meal.name} className="meal-image" />
    <div className="meal-items">
      <h5>{meal.name}</h5>
      <div className="price">${meal.price}</div>
    </div>
    <div className="description">{meal.description}</div>

    <AddForm id={meal.id} name={meal.name} price={meal.price} />
  </li>
);



const MenuCategory = ({ category, meals, collapseOthers, isCollapsed }) => {
  const toggleCollapsed = () => {
    collapseOthers(category);
    setTimeout(() => {
      const scrollPosition = window.scrollY = 250;
      window.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }, 100);
  };



  return (
    <div className="menu-category">
      <h2
        onClick={toggleCollapsed}
        className={`category-title ${isCollapsed ? "collapsed" : "expanded"}`}
      >
        {category}
        <span className={`arrow ${isCollapsed ? "down" : "up"}`}>▼</span>
      </h2>
      {!isCollapsed && (
        <ul>
          {meals.map((meal) => (
            <MenuItem key={meal.id} meal={meal} />
          ))}
        </ul>
      )}
    </div>
  );
};

export const Menu = () => {
  const { store, actions } = useContext(Context);
  const { tableId } = useParams();
  const [client, setClient] = useState({});

  const createClient = async () => {
    if (!sessionStorage.getItem("clientId")) {
      let newClient = await actions.createClient("anonimo");
      setClient(newClient);
      console.log(newClient)
      sessionStorage.setItem("clientId", newClient.id);
    }
  };

  const assingClientToTable = async () => {
    if (!sessionStorage.getItem("clientId")) {
      console.log("No hay cliente");
      return;
    } else if (!sessionStorage.getItem("sessionId")) {
      let clientId = sessionStorage.getItem("clientId");
      const session = await actions.assingClient(tableId, clientId);
      console.log(session)
      sessionStorage.setItem("sessionId", session.id_session);
    }
  };

  const asyncClient = async() => {
    await createClient();
    assingClientToTable();
    
  }
  useEffect(() => {
    
    actions.getMenu();
    asyncClient();
  }, [tableId]);

  const [collapsedCategories, setCollapsedCategories] = useState([]);

  const collapseOthers = (category) => {
    if (collapsedCategories.includes(category)) {
      setCollapsedCategories(
        collapsedCategories.filter((cat) => cat !== category)
      );
    } else {
      setCollapsedCategories([category]);
    }
  };
  const starters = store.menu.filter((item) => item.category === "Starters");
  const mains = store.menu.filter((item) => item.category === "Mains");
  const desserts = store.menu.filter((item) => item.category === "Desserts");
  const drinks = store.menu.filter((item) => item.category === "Drinks");

  return (
    <>
      <Navbar />
      <div className="meals">
        <div className="card">
          <MenuCategory
            category="Starters"
            meals={starters}
            collapseOthers={collapseOthers}
            isCollapsed={!collapsedCategories.includes("Starters")}
          />
          <MenuCategory
            category="Main Course"
            meals={mains}
            collapseOthers={collapseOthers}
            isCollapsed={!collapsedCategories.includes("Main Course")}
          />
          <MenuCategory
            category="Desserts"
            meals={desserts}
            collapseOthers={collapseOthers}
            isCollapsed={!collapsedCategories.includes("Desserts")}
          />
          <MenuCategory
            category="Drinks"
            meals={drinks}
            collapseOthers={collapseOthers}
            isCollapsed={!collapsedCategories.includes("Drinks")}
          />
        </div>
      </div>
      <Footer />
    </>
  );
};
