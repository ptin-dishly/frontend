import React from "react";
import MenuBar from "../components/MenuBar";
import DashboardPage from "./DashboardPage";

export default function MainPage() {
    return (
        <div style={{ display: "flex", backgroundColor: "var(--color-white)", minHeight: "100vh" }}>
            {/* El MenuBar s'inclou aquí per assegurar que la navegació és persistent */}
            <MenuBar role="admin" />
            
        </div>
    );
}