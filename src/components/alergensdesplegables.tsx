import React, { useState } from "react";

const colors = {
  white: "#FAFAFA",
  purple: "#7C3AED",
  dark: "#0F172A",
  green: "#22C55E",
  gray: "#6B7280",
};

const allergensList = [
  "Gluten",
  "Crustacis",
  "Ous",
  "Peix",
  "Cacauets",
  "Soja",
  "Llet",
  "Fruits secs",
  "Api",
  "Mostassa",
  "Sèsam",
  "Sulfits",
  "Tramussos",
  "Mol·luscs",
];

const AllergensDropdown = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const toggleAllergen = (allergen: string) => {
    if (selected.includes(allergen)) {
      setSelected(selected.filter((a) => a !== allergen));
    } else {
      setSelected([...selected, allergen]);
    }
  };

  const containerStyle: React.CSSProperties = {
    position: "relative",
    display: "inline-block",
    fontFamily: "Commissioner, sans-serif",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: colors.purple,
    color: colors.white,
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
  };

  const dropdownStyle: React.CSSProperties = {
    position: "absolute",
    top: "110%",
    left: 0,
    backgroundColor: colors.white,
    border: `1px solid ${colors.gray}`,
    borderRadius: "12px",
    padding: "10px",
    minWidth: "220px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
    zIndex: 10,
    maxHeight: "260px",
    overflowY: "auto",
  };

  const itemStyle = (isSelected: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: isSelected ? colors.green : "transparent",
    color: isSelected ? colors.white : colors.dark,
    fontSize: "12px",
  });

  return (
    <div style={containerStyle}>
      <button style={buttonStyle} onClick={() => setOpen(!open)}>
        Al·lèrgens ({selected.length})
      </button>

      {open && (
        <div style={dropdownStyle}>
          {allergensList.map((allergen) => {
            const isSelected = selected.includes(allergen);

            return (
              <label key={allergen} style={itemStyle(isSelected)}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleAllergen(allergen)}
                />
                {allergen}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllergensDropdown;