import React from "react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  label?: string;
}

export default function BackButton({ label }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        cursor: "pointer",
      }}
      onClick={() => navigate(-1)}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          backgroundColor: "#0F172A",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          fontWeight: "bold",
        }}
      >
        ←
      </div>

      {label && (
        <span
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#0F172A",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}