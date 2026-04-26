import React from "react";

interface BigButtonProps {
  label: string;
  value?: string | number;
  variant?: "navy" | "green";
  onClick?: () => void;
}

export default function BigButton({
  label,
  value,
  variant = "navy",
  onClick,
}: BigButtonProps) {
  const background = variant === "green" ? "#22C55E" : "#0F172A";

  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "18px 25px",
        minWidth: 220,
        borderRadius: 25,
        border: "none",
        backgroundColor: background,
        color: "white",
        fontSize: 18,
        fontWeight: 600,
        boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
        cursor: "pointer",
      }}
    >
      <span>{label}</span>

      {value && (
        <span style={{ fontSize: 26, fontWeight: "bold" }}>
          {value}
        </span>
      )}
    </button>
  );
}