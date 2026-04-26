import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/imagen.png"
import login_style from "./LogInPage.module.css"

export default function LogIn() {
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        navigate("/dashboard");
    };

    return (    
        <div style={{ textAlign: "center", marginTop: "40px" }}>
            <img src={logo} alt="Logo" style={{ width: "200px" }} />
             <div className={login_style.panel}> {
                <form className={login_style.form_style} onSubmit={handleSubmit}>
                    <h2>Log In</h2>

                    <label >Email</label>
                    <input type="email" />

                    <label>Password</label>
                    <input type="password" />

                    <button type="submit" className={login_style.login_button}>Log In</button>

                    <a href="#">Forgot password?</a>
                </form>
             }
             </div>

        </div>

    );
}
