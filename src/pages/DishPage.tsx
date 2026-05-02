import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../utils/storage";
import { recipeService, type Recipe } from "../services/api";
import MenuBar from "../components/MenuBar";
import SearchBar from "../components/SearchBar";
import SelectDropdown from "../components/SelectDropdown";

export default function DishPage() {
  const user = getCurrentUser();
  const userRole = (user?.role || "admin") as "admin" | "kitchen" | "waiter" | "sales";
  const navigate = useNavigate();

  if (!["admin", "kitchen"].includes(userRole)) {
    navigate("/dashboard");
    return null;
  }

  const [dishes, setDishes] = useState<Recipe[]>([]);
  const [globalSearch, setGlobalSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDishes = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await recipeService.getAll();
        if (res.success && res.data) {
          setDishes(res.data);
        }
      } catch (err) {
        console.error("Error fetching dishes:", err);
        setError("Failed to load dishes");
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, []);

  const categories = [
    { label: "All Categories", value: "" },
    ...Array.from(new Set(dishes.map((d) => d.category))).map((cat) => ({
      label: cat,
      value: cat,
    })),
  ];

  const filteredDishes = dishes.filter((dish) => {
    const matchesSearch = dish.name.toLowerCase().includes(globalSearch.toLowerCase());
    const matchesCategory = !categoryFilter || dish.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB" }}>
      <MenuBar role={userRole} />

      <main style={{ flex: 1, padding: "40px 48px" }}>
        <div style={{ marginBottom: 30 }}>
          <h1 style={{ fontSize: 28, color: "#0F172A", margin: 0, fontWeight: 700 }}>
            Dishes
          </h1>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#FEE2E2",
              color: "#DC2626",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "24px",
              fontSize: "14px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: 300, width: "100%" }}>
            <SearchBar
              value={globalSearch}
              onChange={setGlobalSearch}
              placeholder="Search dishes..."
            />
          </div>

          <SelectDropdown
            options={categories}
            value={categoryFilter}
            onChange={setCategoryFilter}
          />

          <button
            onClick={() => navigate("/dishes/new")}
            style={{
              backgroundColor: "var(--color-green)",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            + New Dish
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#6B7280" }}>
            <p>Loading dishes...</p>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
              border: "1px solid #E5E7EB",
              borderRadius: 12,
              overflow: "hidden",
              backgroundColor: "white",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 0.5fr",
                gap: 16,
                padding: "16px 20px",
                backgroundColor: "#F3F4F6",
                fontWeight: 600,
                fontSize: 12,
                color: "#6B7280",
                borderBottom: "1px solid #E5E7EB",
              }}
            >
              <div>Name</div>
              <div>Category</div>
              <div>Prep Time</div>
              <div>Servings</div>
              <div>Actions</div>
            </div>

            {/* Rows */}
            {filteredDishes.length === 0 ? (
              <div style={{ padding: "32px 20px", textAlign: "center", color: "#6B7280" }}>
                No dishes found
              </div>
            ) : (
              filteredDishes.map((dish, index) => (
                <div
                  key={dish.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr 0.5fr",
                    gap: 16,
                    padding: "16px 20px",
                    borderBottom: index < filteredDishes.length - 1 ? "1px solid #E5E7EB" : "none",
                    alignItems: "center",
                    backgroundColor: index % 2 === 0 ? "white" : "#F9FAFB",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F3F4F6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      index % 2 === 0 ? "white" : "#F9FAFB";
                  }}
                  onClick={() => navigate(`/dishes/${dish.id}`)}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, color: "#0F172A", fontSize: 14 }}>
                      {dish.name}
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        color: "#6B7280",
                        fontSize: 12,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {dish.description}
                    </p>
                  </div>
                  <div style={{ fontSize: 13, color: "#0F172A" }}>
                    {dish.category}
                  </div>
                  <div style={{ fontSize: 13, color: "#0F172A" }}>
                    {dish.preparation_time} min
                  </div>
                  <div style={{ fontSize: 13, color: "#0F172A" }}>
                    {dish.servings}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dishes/${dish.id}`);
                      }}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        color: "#7C3AED",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                        padding: "4px 8px",
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}