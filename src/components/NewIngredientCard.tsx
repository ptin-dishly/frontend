import React from "react";

interface NewIngredientCardProps {
  onClick?: () => void;
}

export default function NewIngredientCard({ onClick }: NewIngredientCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 240,
        minHeight: 135,
        backgroundColor: "#22C55E",
        border: "none",
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontFamily: "inherit",
        boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
      }}
    >
      <span
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: "white",
          lineHeight: 1,
        }}
      >
        +
      </span>
    </button>
  );
}