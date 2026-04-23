// src/components/DeleteButton.tsx
import React from "react";
// Importamos el icono de papelera de Heroicons
import { HiOutlineTrash } from "react-icons/hi2";

interface DeleteButtonProps {
  onClick: () => void;
}

export default function DeleteButton({ onClick }: DeleteButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "45px",
        height: "40px",
        backgroundColor: "#E11D48", // Rojo sólido
        borderRadius: "8px",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "background-color 0.2s", // Para que sea más suave al clicar
      }}
      // Efecto simple para que cambie un poco al pasar el ratón (opcional)
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#BE123C")}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#E11D48")}
    >
      {/* Icono de dibujo en blanco */}
      <HiOutlineTrash style={{ color: "#FFFFFF", fontSize: "22px" }} />
    </button>
  );
}
