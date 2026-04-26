// src/components/Notification.tsx
import React from "react";
// Importamos el icono de la campana (v-outline) de la colección Heroicons
import { HiBell } from "react-icons/hi2";

export default function Notification() {
  return (
    <div
      style={{
        width: "50px",
        height: "50px",
        backgroundColor: "#101828", // Tu azul oscuro
        borderRadius: "50%",        // Círculo perfecto
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        cursor: "pointer",
        position: "relative"
      }}
    >
      {/* Usamos el icono, dándole color blanco y el tamaño */}
      <HiBell style={{ color: "#FFFFFF", fontSize: "28px" }} />
      
      {/* El puntito de aviso opcional, si lo quieres mantener */}
      <div style={{
        position: "absolute",
        top: "12px",
        right: "12px",
        width: "10px",
        height: "10px",
        backgroundColor: "#E11D48", // Rojo
        borderRadius: "50%",
        border: "2px solid #101828" // Para que resalte
      }} />
    </div>
  );
}
