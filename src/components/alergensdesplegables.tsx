import React, { useEffect, useState } from "react";
import { allergenService, Allergen } from "../services/api";

const colors = {
  white: "#FAFAFA",
  purple: "#7C3AED",
  dark: "#0F172A",
  green: "#22C55E",
  gray: "#6B7280",
};

const AllergensDropdown = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔥 Cargar alérgenos desde la API
  useEffect(() => {
    const fetchAllergens = async () => {
      try {
        setLoading(true);
        const res = await allergenService.list();
        setAllergens(res.data);
      } catch (error) {
        console.error("Error cargando alérgenos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllergens();
  }, []);

  // ✅ Seleccionar / deseleccionar
  const toggleAllergen = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((a) => a !== id));
    } else {
      setSelected([...selected, id]);
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
          {loading && <p>Cargando...</p>}

          {!loading && allergens.length === 0 && (
            <p>No hay alérgenos</p>
          )}

          {!loading &&
            allergens.map((allergen) => {
              const isSelected = selected.includes(allergen.id);

              return (
                <label key={allergen.id} style={itemStyle(isSelected)}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleAllergen(allergen.id)}
                  />
                  {allergen.nameCa} {/* puedes cambiar a nameEs o nameEn */}
                </label>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default AllergensDropdown;