import React, { useState } from "react";

const colors = {
  white: "#FAFAFA",
  purple: "#7C3AED",
  dark: "#0F172A",
  green: "#22C55E",
  gray: "#6B7280",
};

const categories = [
  "Tots",
  "Carn",
  "Peix",
  "Verdures",
  "Fruita",
  "Làctics",
  "Ous",
  "Secs",
  "Pasta i Arròs",
  "Llegums",
  "Congelats",
  "Begudes",
  "Alcohol",
  "Fleca",
  "Salses",
  "Espècies",
  "Olis",
  "Snacks",
  "Postres",
];

const CategoryBar = () => {
  const [active, setActive] = useState("Tots");

  const containerStyle: React.CSSProperties = {
    display: "flex",
    gap: "10px",
    overflowX: "auto",
    padding: "10px 0",
    fontFamily: "Commissioner, sans-serif",
  };

  const getButtonStyle = (cat: string): React.CSSProperties => ({
    padding: "8px 16px",
    borderRadius: "20px",
    border: "none",
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontSize: "12px",
    transition: "all 0.2s ease",
    backgroundColor: active === cat ? colors.purple : colors.white,
    color: active === cat ? colors.white : colors.dark,
    borderColor: colors.gray,
  });

  return (
    <div style={containerStyle}>
      {categories.map((cat) => (
        <button
          key={cat}
          style={getButtonStyle(cat)}
          onClick={() => setActive(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryBar;