import React from "react";
import MenuBar from "../components/MenuBar";


export default function LogIn() {
    return (
        <div style={{ display: "flex" }}>
            <MenuBar role="admin" />
            <div style={{ flex: 1, padding: 20 }}>
                {/* Main content goes here */}
            </div>
        </div>
    );

}