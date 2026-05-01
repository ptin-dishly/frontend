// src/pages/DishPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuBar from "../components/MenuBar";
import SearchBar from "../components/SearchBar";
import SelectDropdown from "../components/SelectDropdown";
import { type Recipe } from "../services/api";

// Fake data
const FAKE_DISHES: Recipe[] = [
  {
    id: "77777777-0007-0007-0007-000000000001",
    establishment_id: "22222222-0002-0002-0002-000000000001",
    name: "Lasaña de carne",
    description: "Lasaña tradicional italiana con carne picada y bechamel",
    category: "segundo_plato",
    portion_size_kg: 0.4,
    servings: 1,
    preparation_time: 60,
    version: 1,
    created_by: "33333333-0003-0003-0003-000000000001",
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-01-15T10:00:00Z",
  },
  {
    id: "77777777-0007-0007-0007-000000000002",
    establishment_id: "22222222-0002-0002-0002-000000000001",
    name: "Salmón a la plancha",
    description: "Salmón fresco con limón y perejil",
    category: "segundo_plato",
    portion_size_kg: 0.25,
    servings: 1,
    preparation_time: 20,
    version: 1,
    created_by: "33333333-0003-0003-0003-000000000001",
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-01-15T10:00:00Z",
  },
  {
    id: "77777777-0007-0007-0007-000000000003",
    establishment_id: "22222222-0002-0002-0002-000000000001",
    name: "Ensalada César",
    description: "Ensalada con pollo, parmesano y aderezo César",
    category: "entrante",
    portion_size_kg: 0.3,
    servings: 1,
    preparation_time: 15,
    version: 1,
    created_by: "33333333-0003-0003-0003-000000000001",
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-01-15T10:00:00Z",
  },
  {
    id: "77777777-0007-0007-0007-000000000004",
    establishment_id: "22222222-0002-0002-0002-000000000001",
    name: "Crema catalana",
    description: "Postre tradicional catalán con azúcar caramelizado",
    category: "postre",
    portion_size_kg: 0.15,
    servings: 1,
    preparation_time: 30,
    version: 1,
    created_by: "33333333-0003-0003-0003-000000000001",
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-01-15T10:00:00Z",
  },
  {
    id: "77777777-0007-0007-0007-000000000005",
    establishment_id: "22222222-0002-0002-0002-000000000002",
    name: "Pollo al ajillo",
    description: "Pollo con ajo y vino blanco al estilo tradicional",
    category: "segundo_plato",
    portion_size_kg: 0.35,
    servings: 1,
    preparation_time: 35,
    version: 1,
    created_by: "33333333-0003-0003-0003-000000000005",
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-01-15T10:00:00Z",
  },
  {
    id: "77777777-0007-0007-0007-000000000006",
    establishment_id: "22222222-0002-0002-0002-000000000002",
    name: "Patatas bravas",
    description: "Patatas fritas con salsa brava casera",
    category: "entrante",
    portion_size_kg: 0.2,
    servings: 1,
    preparation_time: 25,
    version: 1,
    created_by: "33333333-0003-0003-0003-000000000005",
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-01-15T10:00:00Z",
  },
  {
    id: "77777777-0007-0007-0007-000000000007",
    establishment_id: "22222222-0002-0002-0002-000000000001",
    name: "Salsa bechamel",
    description: "Salsa bechamel base para lasaña",
    category: "salsa",
    portion_size_kg: 0.1,
    servings: 4,
    preparation_time: 15,
    version: 1,
    created_by: "33333333-0003-0003-0003-000000000001",
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-01-15T10:00:00Z",
  },
];

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    entrante: "#7C3AED",
    segundo_plato: "#2563EB",
    postre: "#EC4899",
    salsa: "#F59E0B",
  };
  return colors[category] || "#6B7280";
};

export default function DishPage() {
  const navigate = useNavigate();
  const [globalSearch, setGlobalSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dishes] = useState<Recipe[]>(FAKE_DISHES);

  const categoryOptions = [
    { label: "Totes les categories", value: "" },
    { label: "Entrante", value: "entrante" },
    { label: "Segundo Plato", value: "segundo_plato" },
    { label: "Postre", value: "postre" },
    { label: "Salsa", value: "salsa" },
  ];

  const filteredDishes = dishes.filter((dish) => {
    const matchesSearch =
      dish.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      dish.description?.toLowerCase().includes(globalSearch.toLowerCase());

    const matchesCategory =
      categoryFilter === "" || dish.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#FAFAFA" }}>
      <MenuBar role="admin" />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "40px 20px", alignItems: "center" }}>
        {/* Header */}
        <div style={{ width: "100%", maxWidth: "1400px", marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontFamily: "Fustat, sans-serif", color: "#0F172A", fontSize: "32px", fontWeight: 700, margin: "0 0 8px 0" }}>
              Plats del Restaurant
            </h1>
            <p style={{ color: "#6B7280", fontSize: "14px", margin: 0 }}>
              Gestiona tots els plats disponibles
            </p>
          </div>
          <button
            onClick={() => navigate("/dishes/new")}
            style={{
              padding: "12px 24px",
              backgroundColor: "#22C55E",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#16A34A")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#22C55E")}
          >
            + Nou Plat
          </button>
        </div>

        {/* Search */}
        <div style={{ width: "100%", maxWidth: "1400px", marginBottom: "30px" }}>
          <SearchBar
            value={globalSearch}
            onChange={setGlobalSearch}
            placeholder="Cerca plats per nom o descripció..."
          />
        </div>

        {/* Filter */}
        <div style={{ width: "100%", maxWidth: "1400px", marginBottom: "30px" }}>
          <SelectDropdown
            options={categoryOptions}
            value={categoryFilter}
            onChange={setCategoryFilter}
          />
        </div>

        {/* Dishes List */}
        {filteredDishes.length === 0 ? (
          <div style={{ width: "100%", maxWidth: "1400px", padding: "60px 20px", textAlign: "center", color: "#6B7280", fontSize: "18px" }}>
            No s'han trobat plats
          </div>
        ) : (
          <div style={{ width: "100%", maxWidth: "1400px", backgroundColor: "#FFFFFF", borderRadius: "14px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)", border: "1px solid #E5E7EB", overflow: "hidden" }}>
            {/* Table Header */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 2.5fr 1.2fr 1fr 1fr 1.5fr", gap: "16px", padding: "16px 20px", backgroundColor: "#F9FAFB", borderBottom: "2px solid #E5E7EB", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#0F172A" }}>
              <div>Nom del Plat</div>
              <div>Categoria</div>
              <div>Descripció</div>
              <div>Temps Prep.</div>
              <div>Porcions</div>
              <div>Pes</div>
              <div style={{ textAlign: "right" }}>Accions</div>
            </div>

            {/* Table Body */}
            {filteredDishes.map((dish) => (
              <div
                key={dish.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1.2fr 2.5fr 1.2fr 1fr 1fr 1.5fr",
                  gap: "16px",
                  padding: "16px 20px",
                  borderBottom: "1px solid #E5E7EB",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F9FAFB";
                  e.currentTarget.style.boxShadow = "inset 0 0 0 1px #E5E7EB";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Name */}
                <div>
                  <span style={{ fontFamily: "Fustat, sans-serif", fontSize: "14px", fontWeight: 700, color: "#0F172A" }}>
                    {dish.name}
                  </span>
                </div>

                {/* Category */}
                <div>
                  <span style={{ display: "inline-block", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#FFFFFF", backgroundColor: getCategoryColor(dish.category), padding: "4px 10px", borderRadius: "4px", textAlign: "center" }}>
                    {dish.category}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <span style={{ fontSize: "13px", color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                    {dish.description?.substring(0, 50)}
                    {dish.description && dish.description.length > 50 ? "..." : ""}
                  </span>
                </div>

                {/* Time */}
                <div>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#7C3AED" }}>
                    ⏱️ {dish.preparation_time} min
                  </span>
                </div>

                {/* Servings */}
                <div>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#22C55E" }}>
                    👥 {dish.servings}
                  </span>
                </div>

                {/* Weight */}
                <div>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#F59E0B" }}>
                    📦 {dish.portion_size_kg} kg
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dishes/${dish.id}`);
                    }}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#2563EB",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1D4ED8")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563EB")}
                  >
                    Ver
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dishes/${dish.id}/edit`);
                    }}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#F59E0B",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D97706")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#F59E0B")}
                  >
                    Editar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Add delete confirmation
                    }}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#EF4444",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#DC2626")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#EF4444")}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}