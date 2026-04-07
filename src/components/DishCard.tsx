import React from "react";

interface DishCardProps {
  name: string;
  image: string;
  width?: number;
}

export default function DishCard({ name, image, width = 150 }: DishCardProps) {
  return (
    <div
      style={{
        width,
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        marginTop: 20,
      }}
    >
      <img src={image} alt={name} style={{ width: "100%", height: 100, objectFit: "cover" }} />
      <div style={{ padding: 10, fontWeight: "bold" }}>{name}</div>
    </div>
  );
}
