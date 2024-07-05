
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/signup.css";
import { useNavigate } from "react-router-dom";
import Login from './login';

const Signup = () => {
    const { store, actions } = useContext(Context);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [validatedPassword, setValidatedPassword] = useState("");
    const [restaurantName, setRestaurantName] = useState([
        "Restaurante A",
        "Restaurante B",
        "Restaurante C",
        "Restaurante D"
    ]);
    const [selectedRestaurant, setSelectedRestaurantName] = useState("Restaurante A");
    const [showPassword, setShowPassword] = useState(false);
    const [registerStatus, setRegisterStatus] = useState();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!selectedRestaurant || !firstName || !lastName || !email || !password) {
            alert("All fields are required.");
        } else if (!emailRegex.test(email)) {
            alert("El email es incorrecto.");
        } else if (password.length < 8 || password.length > 12) {
            alert("La contraseña debe tener entre 8 y 12 caracteres.");
        } else {
            const data = await actions.getUserRegister(selectedRestaurant, firstName, lastName, email, password);

            setRegisterStatus(data[0].status);
            if (data[0].status === "ok") {
                setIsLoading(false);

                setTimeout(async () => {
                    setIsLoading(true);
                    await actions.getTokenLogin(email, password);
                    const tokenLocalStoraged = localStorage.getItem("token");
                    if (tokenLocalStoraged) {
                        setTimeout(() => {
                            setIsLoading(false);
                            navigate("/app/caja");
                            setToken(tokenLocalStoraged);
                        }, 3000);
                    }
                }, 2000);
            }
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSelectChange = (event) => {
        setSelectedRestaurantName(event.target.value);
    };

    return (
        <>
            <section>
                {isLoading === true ? (
                    <div className="container-loading">
                        <div className="loading">
                            <div className="dots"></div>
                            <div className="dots"></div>
                            <div className="dots"></div>
                            <span className="text-loading">Loading...</span>
                        </div>
                    </div>
                ) : registerStatus === "ok" ? (
                    <div className="container2">
                        <div className="content">
                            <h1>REGISTERED USER SUCCESSFULLY!</h1>
                        </div>
                    </div>
                ) : (
                    <div className="container">
                        <div className="formulario inputlogin">
                            <form action="#" method="POST">
                                <h1>Sign up</h1>
                                <div className="input-container">
                                    <i className="fa-solid fa-utensils"></i>
                                    <select className="restaurant-dropdown" value={selectedRestaurant} onChange={handleSelectChange}>
                                        <option value="" disabled>Selecciona un Restaurante</option>
                                        {restaurantName.map((name, index) => (
                                            <option key={index} value={name} onChange={handleSelectChange}>
                                                {name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="input-container">
                                    <i className="fa-solid fa-user"></i>
                                    <input type="text" value={firstName} onChange={(event) => { setFirstName(event.target.value); }} required />
                                    <label htmlFor="#">Name</label>
                                </div>
                                <div className="input-container">
                                    <i className="fa-regular fa-user"></i>
                                    <input type="text" value={lastName} onChange={(event) => { setLastName(event.target.value); }} required />
                                    <label htmlFor="#">Last name</label>
                                </div>
                                <div className="input-container">
                                    <i className="fa-solid fa-envelope"></i>
                                    <input type="email" value={email} onChange={(event) => { setEmail(event.target.value); }} required />
                                    <label htmlFor="email">Email</label>
                                </div>
                                <div className="input-container password">
                                    <i className={`fa-solid ${showPassword ? 'fa-lock-open' : 'fa-lock'}`} onClick={togglePasswordVisibility}></i>
                                    <input type={showPassword ? "text" : "password"} value={password} onChange={(event) => { setPassword(event.target.value); }} required />
                                    <label htmlFor="Contraseña">Password</label>
                                </div>
                            </form>
                            <div className="register-button">
                                <button className="r6" onClick={handleSubmit}>Register</button>
                                <p>You have an account?&nbsp; <Link to="/app/login"> Login</Link></p>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </>
    );
};

export default Signup;
