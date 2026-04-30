import React from "react";
import { useNavigate } from "react-router-dom";
import logoII from "../assets/logo_II.png";
import login_style from "./LogInPage.module.css"

export default function LogIn() {
    const navigate = useNavigate();

    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        navigate("/main");
    };

    return (    
        <div style={{ textAlign: "center", marginTop: "40px" }}>
            <img src={logoII} alt="Logo" style={{ width: "235 px", height: "100px" }} />
             <div className={login_style.panel}> {
                <form className={login_style.form_style} onSubmit={handleSubmit}>
                    <h2>Log In</ h2>

                    <label >Email</label>
                    <input type="email" className={login_style.input} />

                    <label>Password</label>
                    <input type="password" className={login_style.input} />

                    <button type="submit" className={login_style.login_button}>Submit</button>

                    <a href="#">Forgot password?</a>
                </form>
             }
             </div>

        </div>

    );
}
