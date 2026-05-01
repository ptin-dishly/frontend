import React from "react";

interface IngredientCardProps {
  category: string;
  name: string;
  image: string;
  quantity: string;
  expiration: string;
  onClick?: () => void;
}

export default function IngredientCard({
  category,
  name,
  image,
  quantity,
  expiration,
  onClick,
}: IngredientCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 240,
        minHeight: 135,
        backgroundColor: "#FAFAFA",
        border: "none",
        borderRadius: 14,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        cursor: onClick ? "pointer" : "default",
        fontFamily: "inherit",
        boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: "#0F172A",
          textAlign: "left",
          marginBottom: 10,
        }}
      >
        <div style={{ textAlign: "left", marginBottom: 10 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#7C3AED",
              textTransform: "uppercase",
              marginRight: 8,
            }}
          >
            {category}
          </span>

          <span
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "#0F172A",
            }}
          >
            {name}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            width: 92,
            height: 60,
            backgroundColor: "#FFFFFF",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <img
            src={image}
            alt={name}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>

        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#0F172A",
            minWidth: 85,
            textAlign: "center",
          }}
        >
          {quantity}
        </div>
      </div>

      <div
        style={{
          fontSize: 14,
          fontWeight: 400,
          color: "#6B7280",
          textAlign: "left",
        }}
      >
        {expiration}
      </div>
    </button>
  );
}